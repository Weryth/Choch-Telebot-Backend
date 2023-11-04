import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { spawn } from 'child_process';

@Injectable()
export class BotsService {
    constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {}

    private bots = new Map<string, any>();

    launchBot(token: string) {
        const botProcess = spawn('node', [`src/bot_ref/userBots/${token}.js`], {
            env: { ...process.env, BOT_TOKEN: token },
        });
        try {
            this.bots.set(token, botProcess);
            return { botToken: token, message: 'Bot activated', status: HttpStatus.OK };
        } catch (error) {
            return new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    stopBot(token: string) {
        const botProcess = this.bots.get(token);
        if (botProcess) {
            botProcess.kill();
            try {
                this.bots.delete(token);
                return { botToken: token, message: 'Bot has been stoped', status: HttpStatus.OK };
            } catch (error) {}
        }
    }
}
