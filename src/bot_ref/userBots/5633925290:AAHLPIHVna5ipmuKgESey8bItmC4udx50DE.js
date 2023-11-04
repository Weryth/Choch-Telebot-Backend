var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var Telegraf = require('telegraf').Telegraf;
var PrismaClient = require('@prisma/client').PrismaClient;
var OpenAIClient = require('openai');
var prisma = new PrismaClient();
var openai = new OpenAIClient({ key: process.env.OPENAI_API_KEY });
var bot = new Telegraf('5633925290:AAHLPIHVna5ipmuKgESey8bItmC4udx50DE');
var botIdDB = '8283a91e-9ec5-4e51-882e-2d2c001aea58';
bot.start(function (ctx) { return ctx.reply('Welcome! Send me a question and I will try to answer it.'); });
bot.on('text', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
    var userText, questions, questionList, waitmsg, gptResponse, matchedQuestion, qa;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userText = ctx.message.text;
                return [4 /*yield*/, prisma.questions.findMany({ where: { botId: botIdDB } })];
            case 1:
                questions = _a.sent();
                questionList = questions.map(function (q) { return q.quest; }).join('\n');
                return [4 /*yield*/, ctx.reply("Секундочку... Ищем ответ на ваш вопрос!")];
            case 2:
                waitmsg = _a.sent();
                return [4 /*yield*/, openai.chat.completions.create({
                        messages: [
                            {
                                role: 'user',
                                content: "Find the closest match to the following question:\nUser Question: ".concat(userText, "\nAvailable Questions:\n").concat(questionList),
                            },
                        ],
                        model: 'gpt-3.5-turbo-0613',
                    })];
            case 3:
                gptResponse = _a.sent();
                matchedQuestion = gptResponse.choices[0].message.content;
                return [4 /*yield*/, prisma.questions.findFirst({ where: { quest: matchedQuestion } })];
            case 4:
                qa = _a.sent();
                return [4 /*yield*/, bot.telegram.deleteMessage(waitmsg.chat.id, waitmsg.message.message_id)];
            case 5:
                _a.sent();
                if (qa && qa.answer) {
                    ctx.reply(qa.answer);
                }
                else {
                    ctx.reply('Sorry, I don’t have an answer to that question.');
                }
                return [2 /*return*/];
        }
    });
}); });
bot.launch();