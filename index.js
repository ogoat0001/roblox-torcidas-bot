
require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const adminCommands = [
  'ban',
  'unban',
  'mute',
  'unmute',
  'kick',
  'limpar'
];

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está funcionando'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Informações do bot'),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false)),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove um banimento')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('id').setDescription('ID do usuário').setRequired(true)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
    .addIntegerOption(o => o.setName('minutos').setDescription('Duração em minutos').setMinValue(1).setMaxValue(40320).setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false)),

  new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Retira o silêncio de um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true)),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa um membro')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(true))
    .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false)),

  new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Apaga mensagens')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption(o => o.setName('quantidade').setDescription('Quantidade de 1 a 100').setMinValue(1).setMaxValue(100).setRequired(true)),

  new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Lista os comandos do bot'),

  new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Mostra as regras do servidor'),

  new SlashCommandBuilder()
    .setName('servidor')
    .setDescription('Informações do servidor'),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostra o avatar de um membro')
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(false)),

  new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra informações de um membro')
    .addUserOption(o => o.setName('membro').setDescription('Membro').setRequired(false))
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

  const { commandName, guild, options } = interaction;

  try {
    if (adminCommands.includes(commandName)) {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: '⛔ Apenas administradores podem usar este comando.',
          ephemeral: true
        });
      }
    }

    if (commandName === 'ping') {
      return interaction.reply('🏓 Pong! Estou funcionando!');
    }

    if (commandName === 'info') {
      return interaction.reply('🤖 Roblox Torcidas RP - BOT está online!');
    }

    if (commandName === 'ban') {
      const user = options.getUser('membro');
      const motivo = options.getString('motivo') || 'Não informado';

      await guild.members.ban(user.id, { reason: motivo });
      return interaction.reply(`🔨 ${user.tag} foi banido. Motivo: ${motivo}`);
    }

    if (commandName === 'unban') {
      const id = options.getString('id');
      await guild.members.unban(id);
      return interaction.reply(`✅ Banimento do ID ${id} removido.`);
    }

    if (commandName === 'mute') {
      const user = options.getUser('membro');
      const minutos = options.getInteger('minutos');
      const membro = await guild.members.fetch(user.id);

      await membro.timeout(
        minutos * 60000,
        options.getString('motivo') || 'Não informado'
      );

      return interaction.reply(`🔇 ${user.tag} silenciado por ${minutos} minutos.`);
    }

    if (commandName === 'unmute') {
      const user = options.getUser('membro');
      const membro = await guild.members.fetch(user.id);

      await membro.timeout(null);
      return interaction.reply(`🔊 Silenciamento de ${user.tag} removido.`);
    }

    if (commandName === 'kick') {
      const user = options.getUser('membro');
      const membro = await guild.members.fetch(user.id);

      await membro.kick(options.getString('motivo') || 'Não informado');
      return interaction.reply(`👢 ${user.tag} foi expulso.`);
    }

    if (commandName === 'limpar') {
      const quantidade = options.getInteger('quantidade');
      const mensagens = await interaction.channel.bulkDelete(quantidade, true);

      return interaction.reply({
        content: `🧹 ${mensagens.size} mensagens apagadas.`,
        ephemeral: true
      });
    }

    if (commandName === 'ajuda') {
      return interaction.reply({
        content:
          '**🤖 ROBLOX TORCIDAS RP - BOT**\n\n' +
          '**🔨 MODERAÇÃO (ADMINISTRADORES)**\n' +
          '`/ban` `/unban` `/mute` `/unmute` `/kick` `/limpar`\n\n' +
          '**📚 INFORMAÇÕES (TODOS)**\n' +
          '`/regras` `/servidor` `/avatar` `/perfil` `/ping` `/info`',
        ephemeral: true
      });
    }

    if (commandName === 'regras') {
      return interaction.reply({
        content: '📜・𝐑𝐄𝐆𝐑𝐀𝐒 𝐎𝐅𝐈𝐂𝐈𝐀𝐈𝐒 𝐃𝐎 𝐒𝐄𝐑𝐕𝐈𝐃𝐎𝐑

Seja bem-vindo(a)! Para mantermos uma comunidade organizada, segura e respeitosa, todos devem seguir as regras abaixo.

━━━━━━━━━━━━━━━━━━━━

🚫・𝟎𝟏. 𝐇𝐎𝐌𝐎𝐅𝐎𝐁𝐈𝐀, 𝐏𝐄𝐃𝐎𝐅𝐈𝐋𝐈𝐀 𝐄 𝐃𝐈𝐒𝐂𝐑𝐈𝐌𝐈𝐍𝐀𝐂̧𝐀̃𝐎

・Proibido qualquer tipo de homofobia, racismo, preconceito ou discriminação social.
・Não serão tolerados apelidos ofensivos ou comentários discriminatórios.
・Qualquer apologia ou incentivo à pedofilia é terminantemente proibido.
・𝐑𝐄𝐒𝐏𝐄𝐈𝐓𝐄 𝐓𝐎𝐃𝐎𝐒 𝐎𝐒 𝐌𝐄𝐌𝐁𝐑𝐎𝐒!

🔞・𝟎𝟐. 𝐍𝐒𝐅𝐖, 𝐏𝐎𝐑𝐍𝐎𝐆𝐑𝐀𝐅𝐈𝐀 𝐄 𝐂𝐎𝐍𝐓𝐄𝐔́𝐃𝐎 𝟏𝟖+

・Proibido enviar pornografia ou qualquer conteúdo sexual explícito.
・Não compartilhe imagens, vídeos ou links impróprios para menores de idade.
・Conteúdos NSFW não são permitidos em nenhum canal.
・𝐓𝐎𝐋𝐄𝐑𝐀̂𝐍𝐂𝐈𝐀 𝐙𝐄𝐑𝐎 𝐏𝐀𝐑𝐀 𝐂𝐎𝐍𝐓𝐄𝐔́𝐃𝐎 𝐈𝐌𝐏𝐑𝐎́𝐏𝐑𝐈𝐎!

🤝・𝟎𝟑. 𝐑𝐄𝐒𝐏𝐄𝐈𝐓𝐎 𝐄𝐍𝐓𝐑𝐄 𝐌𝐄𝐌𝐁𝐑𝐎𝐒

・Trate todos com educação.
・Evite provocações e discussões desnecessárias.
・Não pratique bullying, ameaças ou perseguições.

📢・𝟎𝟒. 𝐒𝐏𝐀𝐌 𝐄 𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐎̃𝐄𝐒

・Evite mensagens repetitivas, flood ou excesso de marcações.
・Não divulgue outros servidores sem autorização.
・Proibido compartilhar golpes ou links maliciosos.

🛡️・𝟎𝟓. 𝐑𝐄𝐒𝐏𝐄𝐈𝐓𝐎 𝐀̀ 𝐒𝐓𝐀𝐅𝐅

・Respeite as decisões da equipe administrativa.
・Não atrapalhe o trabalho dos moderadores.
・Em caso de discordância, procure a equipe responsável.

⚖️・𝟎𝟔. 𝐏𝐔𝐍𝐈𝐂̧𝐎̃𝐄𝐒

O descumprimento das regras poderá resultar em:

・Advertência (AVISO)
・Mute (SILENCIAMENTO)
・Kick (EXPULSÃO)
・Banimento (PERMANENTE OU TEMPORÁRIO)

𝐀 𝐆𝐑𝐀𝐕𝐈𝐃𝐀𝐃𝐄 𝐃𝐀 𝐈𝐍𝐅𝐑𝐀𝐂̧𝐀̃𝐎 𝐃𝐄𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐑𝐀́ 𝐀 𝐏𝐔𝐍𝐈𝐂̧𝐀̃𝐎.

━━━━━━━━━━━━━━━━━━━━

⚠️ 𝐀𝐓𝐄𝐍𝐂̧𝐀̃𝐎!
Ao permanecer no servidor, você concorda em respeitar todas as regras estabelecidas.

❤️ 𝐀 𝐄𝐐𝐔𝐈𝐏𝐄 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐓𝐈𝐕𝐀 𝐀𝐆𝐑𝐀𝐃𝐄𝐂𝐄 𝐀 𝐂𝐎𝐋𝐀𝐁𝐎𝐑𝐀𝐂̧𝐀̃𝐎!

@everyone.',
        ephemeral: true
      });
    }

    if (commandName === 'servidor') {
      const embed = new EmbedBuilder()
        .setTitle(`🏟️ ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields({
          name: 'Membros',
          value: `${guild.memberCount}`,
          inline: true
        })
        .setColor(0x3498DB);

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'avatar') {
      const user = options.getUser('membro') || interaction.user;

      return interaction.reply(
        user.displayAvatarURL({ size: 1024 })
      );
    }

    if (commandName === 'perfil') {
      const user = options.getUser('membro') || interaction.user;
      const membro = await guild.members.fetch(user.id);

      const embed = new EmbedBuilder()
        .setTitle(`👤 Perfil de ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'ID', value: user.id },
          {
            name: 'Conta criada',
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`
          },
          {
            name: 'Entrou no servidor',
            value: membro.joinedTimestamp
              ? `<t:${Math.floor(membro.joinedTimestamp / 1000)}:D>`
              : 'Desconhecido'
          }
        )
        .setColor(0x3498DB);

      return interaction.reply({ embeds: [embed] });
    }

  } catch (error) {
    console.error(error);

    const resposta = {
      content: '❌ Erro ao executar. Verifique as permissões do bot.',
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(resposta);
    }

    return interaction.reply(resposta);
  }
});

client.login(process.env.DISCORD_TOKEN);
