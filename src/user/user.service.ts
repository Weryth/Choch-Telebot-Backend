import { createBotDto } from '@auth/dto/createbot.dto';
import { JwtPayload } from '@auth/interfaces';
import { convertToSecondsUtil } from '@common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';
import { BotTokenDTO } from './user.dto/userbottoken.dto';
import { Telegraf } from 'telegraf';
import { QuestDTO } from './user.dto/quest.dto';
import { BotRef } from 'src/bot_ref/bot.class.create';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {}

    async save(user: Partial<User>) {
        const hashedPassword = user?.password ? this.hashPassword(user.password) : null;
        const savedUser = await this.prismaService.user.upsert({
            where: {
                email: user.email,
            },
            update: {
                password: hashedPassword ?? undefined,
                provider: user?.provider ?? undefined,
                roles: user?.roles ?? undefined,
                isBlocked: user?.isBlocked ?? undefined,
            },
            create: {
                email: user.email,
                password: hashedPassword,
                provider: user?.provider,
                roles: ['USER'],
            },
        });
        await this.cacheManager.set(savedUser.id, savedUser);
        await this.cacheManager.set(savedUser.email, savedUser);
        return savedUser;
    }

    async findOne(idOrEmail: string, isReset = false): Promise<User> {
        if (isReset) {
            await this.cacheManager.del(idOrEmail);
        }
        const user = await this.cacheManager.get<User>(idOrEmail);
        if (!user) {
            const user = await this.prismaService.user.findFirst({
                where: {
                    OR: [{ id: idOrEmail }, { email: idOrEmail }],
                },
            });
            if (!user) {
                return null;
            }
            await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')));
            return user;
        }
        return user;
    }

    async delete(id: string, user: JwtPayload) {
        if (user.id !== id && !user.roles.includes(Role.ADMIN)) {
            throw new ForbiddenException();
        }
        await Promise.all([this.cacheManager.del(id), this.cacheManager.del(user.email)]);
        return this.prismaService.user.delete({ where: { id }, select: { id: true } });
    }

    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }

    async createBot(botData: createBotDto, userPayload: JwtPayload){
        try {
            const bot = await this.prismaService.bots.create({
                data: {
                    bottoken: botData.bottoken,
                    botname: botData.botname, 
                    userId: userPayload.id
                }
            })
            const createBotFile = new BotRef()
            createBotFile.CreateBotFile(botData.bottoken, bot.id)

            
            if(bot){
                return new HttpException(JSON.stringify(bot), HttpStatus.OK)
            }
            
        } catch (error) {
            throw new HttpException(`Ошибка в создании бота: ${error}`, HttpStatus.BAD_REQUEST)
        }
    }

    async checkAllBots(userPayload: JwtPayload){
        console.log(userPayload.id)
        return await this.prismaService.bots.findMany({
            where:{userId: userPayload.id}
        })
    }

    async checkValidTgToken(check: BotTokenDTO) {
        const bot = new Telegraf(check.token);
        try {
            await bot.telegram.getMe();  
            return HttpStatus.OK;
        } catch (error) {
            if (error.code === 401) {  // Проверка на код ошибки 401
                throw new HttpException("Token is not valid", HttpStatus.NOT_FOUND);
            } else {
                throw new HttpException("An error occurred", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async resetPasswordDirectly(userId: string, newPassword: string): Promise<User> {
        const hashedPassword = this.hashPassword(newPassword);
    
        try {
            const user = await this.prismaService.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return user;
        } catch (error) {
            throw new HttpException('Ошибка при обновлении пароля', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    /*async createQuest(userPayload: JwtPayload, questData: QuestDTO){
        try {
            const bot = await this.prismaService.questions.create({
                data: {
                    quest: questData.quest,
                    answer: questData.answer,
                    botId: questData.botID
                }
            })
            if(bot){
                return new HttpException(JSON.stringify(bot), HttpStatus.OK)
            }
            
        } catch (error) {
            throw new HttpException(`Ошибка в создании бота: ${error}`, HttpStatus.BAD_REQUEST)
        }
    }*/
}
