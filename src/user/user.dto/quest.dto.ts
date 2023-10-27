import { IsNotEmpty } from "class-validator"

export class QuestDTO{
    @IsNotEmpty()
    quest: String

    @IsNotEmpty()
    answer: String
    
    @IsNotEmpty()
    botID:String
}