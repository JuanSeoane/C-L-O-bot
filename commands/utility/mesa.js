const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const verificarPermissao = require('./verificacao');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criar-mesa')
    .setDescription('Cria uma categoria privada com um canal de texto e voz para uma mesa.')
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Nome da categoria (mesa)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('texto')
        .setDescription('Nome do canal de texto')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('voz')
        .setDescription('Nome do canal de voz')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('mestre')
        .setDescription('Usuário que será o mestre da mesa')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Cargo que poderá ver os canais da mesa')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const roleNecessaria = '🤵 ᆞ Gerente';
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const nomeCategoria = interaction.options.getString('categoria');
    const nomeTexto = interaction.options.getString('texto');
    const nomeVoz = interaction.options.getString('voz');
    const mestre = interaction.options.getUser('mestre');
    const role = interaction.options.getRole('role'); // ← pega o cargo opcional
    const guild = interaction.guild;

    const overwrites = [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: mestre.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.SendMessagesInThreads,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.ManageThreads,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.MentionEveryone,
          PermissionFlagsBits.UseExternalEmojis,
          PermissionFlagsBits.UseExternalStickers,
          PermissionFlagsBits.UseApplicationCommands,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak,
          PermissionFlagsBits.Stream,
          PermissionFlagsBits.UseVAD,
          PermissionFlagsBits.PrioritySpeaker,
          PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.DeafenMembers,
          PermissionFlagsBits.MoveMembers,
        ],
      },
    ];

    // Adiciona permissões para a role, se fornecida
    if (role) {
      overwrites.push({
        id: role.id,
        allow: [PermissionFlagsBits.ViewChannel],
      });
    }

    try {
      // Cria a categoria
      const categoria = await guild.channels.create({
        name: nomeCategoria,
        type: ChannelType.GuildCategory,
        permissionOverwrites: overwrites,
      });

      // Cria o canal de texto
      const canalTexto = await guild.channels.create({
        name: nomeTexto,
        type: ChannelType.GuildText,
        parent: categoria.id,
        permissionOverwrites: categoria.permissionOverwrites.cache.map(po => po),
      });

      await canalTexto.send(`Bem-vindo à sua mesa, <@${mestre.id}>! Você é o dono aqui.`);

      // Cria o canal de voz
      await guild.channels.create({
        name: nomeVoz,
        type: ChannelType.GuildVoice,
        parent: categoria.id,
        permissionOverwrites: overwrites,
      });

      await interaction.reply(`✅ Mesa criada com sucesso! O mestre <@${mestre.id}> tem controle total.${role ? ` A role <@&${role.id}> pode visualizar os canais.` : ''}\nQualquer problema basta chamar a <@1025869504556847225>`);
    } catch (error) {
      console.error('Erro ao criar a mesa:', error);
      const erroDetalhado = error.message || 'Erro desconhecido';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: `❌ Erro ao criar a mesa: \`${erroDetalhado}\``, ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ Erro ao criar a mesa: \`${erroDetalhado}\``, ephemeral: true });
      }
    }
  },
};
