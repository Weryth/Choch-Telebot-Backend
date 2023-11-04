const { Telegraf } = require('telegraf');
const { PrismaClient } = require('@prisma/client');
const OpenAIClient = require('openai');

const prisma = new PrismaClient();
const openai = new OpenAIClient({ key: process.env.OPENAI_API_KEY });

const bot = new Telegraf('<<TelegramBotToken>>');
const botIdDB = '<<botIdDB>>';

bot.start((ctx) => ctx.reply('Здравствуйте! Отправьте мне ваш вопрос, а я постараюсь ответить на него.'));

bot.on('text', async (ctx) => {
    const userText = ctx.message.text;

    const questions = await prisma.questions.findMany({ where: { botId: botIdDB } });
    const questionList = questions.map((q) => q.quest).join('\n');
    const waitmsg = await ctx.reply("Секундочку... Ищем ответ на ваш вопрос!")
    const gptResponse = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: `Find the closest match to the following question:\nUser Question: ${userText}\nAvailable Questions:\n${questionList}`,
            },
        ],
        model: 'gpt-3.5-turbo-0613',
    });
    
    //console.log(gptResponse.choices[0].message.content);
    const matchedQuestion = gptResponse.choices[0].message.content;

    const qa = await prisma.questions.findFirst({ where: { quest: matchedQuestion } });
    
    
    if (qa && qa.answer) {
        ctx.reply(qa.answer);
    } else {
        ctx.reply('Извините, У меня нет ответа на ваш вопрос, задайте его человеку.');
    }
});

bot.launch();
