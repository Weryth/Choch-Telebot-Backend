import { IsNotEmpty } from "class-validator"

export class QuestDTO{
    @IsNotEmpty()
    quest: string

    @IsNotEmpty()
    answer: string
    
    @IsNotEmpty()
    botID: string
}