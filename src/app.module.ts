import { JwtAuthGuard } from '@auth/guargs/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { BotsModule } from './bots/bots.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        UserModule,
        PrismaModule,
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }),
        MailerModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: 'smtp.yandex.ru',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'choch.corp@yandex.ru',
                        pass: 'firigqxjudhjoobx',
                    },
                },
                defaults: {
                    from: '"CHOCH TELEBOT" <choch.corp@yandex.ru>',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
