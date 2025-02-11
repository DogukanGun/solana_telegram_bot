import { Telegraf } from 'telegraf';

const token = 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new Telegraf(token);

// Handle /trade command
bot.command('trade', (ctx) => {
  const tradeDemand = ctx.message.text.split(' ').slice(1).join(' ');
  if (tradeDemand) {
    ctx.reply(`Received trade demand: ${tradeDemand}`);
  } else {
    ctx.reply('Please provide a trade demand after the /trade command.');
  }
});

// Handle /s_webhook command
bot.command('s_webhook', (ctx) => {
  const webhookUrl = ctx.message.text.split(' ').slice(1).join(' ');
  if (webhookUrl) {
    bot.telegram.setWebhook(webhookUrl)
      .then(() => {
        ctx.reply(`Webhook set to: ${webhookUrl}`);
      })
      .catch((error) => {
        ctx.reply(`Failed to set webhook: ${error.message}`);
      });
  } else {
    ctx.reply('Please provide a webhook URL after the /s_webhook command.');
  }
});

// Start the bot
bot.launch();

console.log('Bot is running...'); 