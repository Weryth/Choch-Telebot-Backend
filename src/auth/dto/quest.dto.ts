import { IsNotEmpty } from 'class-validator';

export class QuestDataDTO {
    @IsNotEmpty()
    questId: string;

    @IsNotEmpty()
    quest: string;

    @IsNotEmpty()
    answer: string;
}
