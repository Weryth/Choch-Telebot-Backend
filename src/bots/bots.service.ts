import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { spawn } from 'child_process';

@Injectable()
export class BotsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    private bots = new Map<string, any>();

    launchBot(token: string) {
        const botProcess = spawn('node', [`src/bot_ref/userBots/${token}.js`], {
        env: { ...process.env, BOT_TOKEN: token },
        });
        this.bots.set(token, botProcess);
    }

    stopBot(token: string) {
        const botProcess = this.bots.get(token);
        if (botProcess) {
          botProcess.kill();
          this.bots.delete(token);
        }
    }
}
