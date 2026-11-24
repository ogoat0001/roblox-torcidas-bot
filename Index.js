
require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, bot => {
  console.log(`Roblox Torcidas RP - BOT conectado como ${bot.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong! Estou funcionando!');
  }

  if (interaction.commandName === 'info') {
    await interaction.reply({
      content: '🤖 Roblox Torcidas RP - BOT está online!',
      ephemeral: true
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
