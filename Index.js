

require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está funcionando'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Informações do Roblox Torcidas RP')
].map(command => command.toJSON());

client.once(Events.ClientReady, async bot => {
  console.log(`Bot conectado: ${bot.user.tag}`);

  const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
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
