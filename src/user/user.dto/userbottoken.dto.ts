import { IsNotEmpty } from "class-validator";

export class BotTokenDTO{

    @IsNotEmpty()
    token : string

}