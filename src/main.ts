import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: "http://localhost:5000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
      });
    app.useGlobalInterceptors();
    await app.listen(3000);
}
bootstrap();
