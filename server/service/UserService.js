const UserDto = require('../../dto/UserDto');
const BotService = require('./BotService');
const MathbotanApi = require('../../http/api-matchbotan');
const { sleep } = require('../../utils/utils');

const PAY_URL = process.env.PAY_URL;

class UserService {
  mediaGroupsList = [];

  async createFollower(msg) {
    const chat_id = msg.chat.id;
    const from_id = msg.from.id;

    const userDto = UserDto.fromUserEntity(msg.from);
    await MathbotanApi.createFollower(userDto.toPlainObject());
    const data = await MathbotanApi.getSubscription(from_id);
    if (data?.status === 'ACTIVE')
      return await BotService.sendMessage(chat_id, `Подписка активна.`);
    await BotService.sendMessage(
      chat_id,
      `Ваша ссылка на оплату: ${PAY_URL}?tg=${from_id}\n\nПосле оплаты бот выдаст приглашение на вступление в чат.`
    );
  }

  async sendLink(user_id, link) {
    await BotService.sendMessage(
      user_id,
      `Thanks!\n\nЗаходите по ссылке: ${link}`
    );
  }

  async joinGroup(msg) {
    const chat_id = msg.chat.id;
    const from_id = msg.from.id;

    const data = await MathbotanApi.getSubscription(from_id);

    if (data?.status === 'ACTIVE')
      return await BotService.approveChatJoinRequest(chat_id, from_id);
    if (data?.status === 'NOT_ACTIVE')
      return await BotService.declineChatJoinRequest(chat_id, from_id);
  }

  async sendMessages({ users, text }) {
    for (const user of users) {
      try {
        await BotService.sendMessage(user, text, { parse_mode: 'HTML' });
        await sleep(1500);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async sendComment(msg) {
    const channel_id = process.env.CHAT_ID;
    if (!msg?.is_automatic_forward && !msg?.sender_chat?.id !== channel_id)
      return;
    if (msg?.media_group_id) {
      if (this.mediaGroupsList.includes(msg?.media_group_id)) return;
      this.mediaGroupsList.push(msg?.media_group_id);
    }
    const message_id = msg.message_id;
    const chat_id = msg.chat.id;

    try {
      await BotService.replyToMessage(
        message_id,
        'Всего 299₽, чтобы получить доступ к комментариям: @MathBotanBot\n\nПочему так? https://t.me/mathbotan/552',
        chat_id
      );
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new UserService();
