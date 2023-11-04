import { Controller, Param, Post } from '@nestjs/common';
import { BotsService } from './bots.service';

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
    
    
}
