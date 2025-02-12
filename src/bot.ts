import { Telegraf, Markup, session } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { SessionContext } from './types';

const token = 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new Telegraf<SessionContext>(token);
const prisma = new PrismaClient();

// Use session middleware
bot.use(session());

// Function to handle new user addition
bot.on('new_chat_members', async (ctx) => {
  const newMember = ctx.message.new_chat_members[0];
  if (newMember.id === ctx.botInfo.id) {
    await ctx.reply('Please define a name for the agent:', Markup.inlineKeyboard([
      Markup.button.callback('Define Name', 'define_name')
    ]));
  }
});

// Handle the callback for defining the name
bot.action('define_name', async (ctx) => {
  await ctx.reply('Please enter a name for the agent:');
  
  ctx.session.waitingForName = true;
});

// Handle text messages
bot.on('text', async (ctx) => {
  if (ctx.session.waitingForName) {
    const agentName = ctx.message.text;

    // Create a new telegramGroup object in the database
    await prisma.telegramGroup.create({
      data: {
        name: agentName,
        chatId: ctx.chat.id.toString(),
      },
    });

    await ctx.reply(`Agent name "${agentName}" has been set. The agent is now operational.`);
    ctx.session.waitingForName = false; // Reset user state
  }
});

bot.command('trade', async (ctx) => {
  const tradeDemand = ctx.message.text.split(' ').slice(1).join(' ');
  if (tradeDemand) {
    await prisma.tradeSignal.create({
      data: {
        condition: tradeDemand,
        groupId: ctx.chat.id.toString(),
      },
    });
    // TODO: ask ai model to generate a tx for the trade demand
    ctx.reply(`Received trade demand: ${tradeDemand}`);
  } else {
    ctx.reply('Please provide a trade demand after the /trade command.');
  }
});

bot.command("trigger", async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  const tags: string[] = [];
  let condition: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag') {
      while (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        tags.push(args[i + 1]);
        i++;
      }
    } else if (args[i] === '--condition') {
      if (i + 1 < args.length) {
        condition = args[i + 1];
        i++;
      }
    }
  }

  if (tags.length > 0 && condition) {
    const group = await prisma.telegramGroup.findUnique({
      where: {
        chatId: ctx.chat.id.toString(),
      }
    });
    if (!group) {
      await prisma.tradeSignal.create({
        data: {
          condition: condition,
          groupId: ctx.chat.id.toString(),
        },
      });
      ctx.reply(`Tags: ${tags.join(', ')}, Condition: ${condition}. Trigger is generated`);
    } else {
      ctx.reply('Please provide tags and a condition using --tag and --condition.');
    }
  }
});

bot.launch();

console.log('Bot is running...');