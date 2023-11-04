import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Provider, Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { compareSync } from 'bcrypt';
import { add } from 'date-fns';
import { v4 } from 'uuid';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService,
        private readonly mailerService: MailerService,
    ) {}

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
        const token = await this.prismaService.token.delete({ where: { token: refreshToken } });
        if (!token || new Date(token.exp) < new Date()) {
            throw new UnauthorizedException();
        }
        const user = await this.userService.findOne(token.userId);
        return this.generateTokens(user, agent);
    }

    async register(dto: RegisterDto) {
        const user: User = await this.userService.findOne(dto.email).catch((err) => {
            this.logger.error(err);
            return null;
        });
        if (user) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }
        return this.userService.save(dto).catch((err) => {
            this.logger.error(err);
            return null;
        });
    }

    async login(dto: LoginDto, agent: string): Promise<Tokens> {
        const user: User = await this.userService.findOne(dto.email, true).catch((err) => {
            this.logger.error(err);
            return null;
        });
        if (!user || !compareSync(dto.password, user.password)) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }
        return this.generateTokens(user, agent);
    }

    private async generateTokens(user: User, agent: string): Promise<Tokens> {
        const accessToken =
            'Bearer ' +
            this.jwtService.sign({
                id: user.id,
                email: user.email,
                roles: user.roles,
            });
        const refreshToken = await this.getRefreshToken(user.id, agent);
        //console.log(refreshToken);
        return { accessToken, refreshToken };
    }

    private async getRefreshToken(userId: string, agent: string): Promise<Token> {
        const _token = await this.prismaService.token.findFirst({
            where: {
                userId,
                userAgent: agent,
            },
        });

        const token = _token?.token;
        if (!token) {
            return this.prismaService.token.create({
                data: {
                    token: v4(),
                    exp: add(new Date(), { months: 1 }),
                    userId,
                    userAgent: agent,
                },
            });
        }

        return this.prismaService.token.upsert({
            where: { token },
            update: {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
            },
            create: {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
                userId,
                userAgent: agent,
            },
        });
    }

    deleteRefreshToken(token: string) {
        return this.prismaService.token.delete({ where: { token } });
    }

    async providerAuth(email: string, agent: string, provider: Provider) {
        const userExists = await this.userService.findOne(email);
        if (userExists) {
            const user = await this.userService.save({ email, provider }).catch((err) => {
                this.logger.error(err);
                return null;
            });
            return this.generateTokens(user, agent);
        }
        const user = await this.userService.save({ email, provider }).catch((err) => {
            this.logger.error(err);
            return null;
        });
        if (!user) {
            throw new HttpException(
                `Не получилось создать пользователя с email ${email} в Google auth`,
                HttpStatus.BAD_REQUEST,
            );
        }
        return this.generateTokens(user, agent);
    }

    async forgotPassword(email: string) {
        const user = await this.userService.findOne(email);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
    
        const newPassword = Math.random().toString(36).slice(-8);
        const userEmail = user.email;
    
        const updatedUser = await this.userService.resetPasswordDirectly(user.id, newPassword);
    
        const message = `
        <body>
            <h2>Данные для входа в ваш аккаунт:</h2>
            <p>Ваш email: ${userEmail}</p>
            <p>Ваш новый пароль: ${newPassword}</p>
        </body>`;
    
        await this.mailerService.sendMail({
            to: email,
            subject: 'Ваш новый пароль',
            html: message,
        });
    
        return updatedUser;
    }
}
