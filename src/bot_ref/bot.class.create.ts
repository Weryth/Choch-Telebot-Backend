import { promises as fs } from 'fs';

export class BotRef {
    async CreateBotFile(bottoken: string, botIdDB: string) {
        try {
            const botFilePath = 'src/bot_ref/bot.ref.js';
            let botFileData = await fs.readFile(botFilePath, 'utf-8');
            botFileData = botFileData.replace('<<TelegramBotToken>>', bottoken);
            botFileData = botFileData.replace('<<botIdDB>>', botIdDB);

            await fs.writeFile(`src/bot_ref/userBots/${bottoken}.js`, botFileData);
        } catch (error) {
            console.error(error)
        }
    }
}

