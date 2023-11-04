import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { spawn } from 'child_process';

@Injectable()
export class BotsService {
    constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {}

    private bots = new Map<string, any>();

    async launchBot(token: string) {
        const botProcess = spawn('node', [`src/bot_ref/userBots/${token}.js`], {
            env: { ...process.env, BOT_TOKEN: token },
        });
        try {
            this.bots.set(token, botProcess);
            await this.prismaService.bots.update({
                where: { bottoken: token },
                data: {
                    isActive: true,
                },
            });
            return { botToken: token, message: 'Bot activated', status: HttpStatus.OK };
        } catch (error) {
            return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async stopBot(token: string) {
        const botProcess = this.bots.get(token);
        if (botProcess) {
            try {
                botProcess.kill();
                this.bots.delete(token);
                await this.prismaService.bots.update({
                    where: { bottoken: token },
                    data: {
                        isActive: false,
                    },
                });
                return { botToken: token, message: 'Bot has been stoped', status: HttpStatus.OK };
            } catch (error) {}
        }
    }
}
