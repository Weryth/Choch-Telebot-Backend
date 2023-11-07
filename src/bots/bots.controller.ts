import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BotsService } from './bots.service';
import { QuestDataDTO } from '@auth/dto/quest.dto';


@Controller('bots')
export class BotsController {
    constructor(private readonly botsService: BotsService) {}

    @Post('launch/:token')
    launchBot(@Param('token') token: string) {
        return this.botsService.launchBot(token);
    }

    @Post('stop/:token')
    stopBot(@Param('token') token: string) {
        return this.botsService.stopBot(token);
    }

    @Get("questions/:idbot")
    takeAllQuestions(@Param('idbot') idbot: string){
        return this.botsService.TakeAllQuestions(idbot)
    }

    @Post("questions/update")
    UpdateQuestrion(@Body() questData: QuestDataDTO){
        return this.botsService.ChangeQuest(questData)
    }

    @Delete('questions/delete/:questId')
    DeleteQuest(@Param('questId') questId: string){
        return this.botsService.DeleteQuest(questId)
    }
    
    
}
