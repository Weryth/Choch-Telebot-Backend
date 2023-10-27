import { JwtPayload } from '@auth/interfaces';
import { CurrentUser } from '@common/decorators';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpException,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UseInterceptors,
    UsePipes,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { UserResponse } from './responses';
import { UserService } from './user.service';
import { createBotDto } from '@auth/dto/createbot.dto';
import { th } from 'date-fns/locale';
import { use } from 'passport';
import { BotTokenDTO } from './user.dto/userbottoken.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.userService.findOne(idOrEmail);
        return new UserResponse(user);
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
        return this.userService.delete(id, user);
    }

    @Get()
    me(@CurrentUser() user: JwtPayload) {
        return user;
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Put()
    async updateUser(@Body() body: Partial<User>) {
        const user = await this.userService.save(body);
        return new UserResponse(user);
    }

    @Get('hi')
    GetHello(@CurrentUser() user: JwtPayload){
        if(!user.roles.includes(Role.ADMIN)){
            return `Hi`
        }
    }

    
    @Post('createBot')
    async CreateBot(@Body() createbotdata: createBotDto, @CurrentUser() user: JwtPayload){
        //console.log(user.id)
        if(user.id){
            const bot = await this.userService.createBot(createbotdata, user)
            return bot
        }else{
            throw new ForbiddenException()
        }
        
    }

    @Post('allUserBots')
    async GetAllUserBots(@CurrentUser() user: JwtPayload){
        const result = await this.userService.checkAllBots(user);
        //console.log(result);
        return result;
    }

    @Post('checkbot')
    async TelegramCheckBot(@Body() token: BotTokenDTO, @CurrentUser() user: JwtPayload){
        //console.log(token)
        if(user.id){
            return this.userService.checkValidTgToken(token)
        }else{
            return new ForbiddenException()
        }
    }

}
