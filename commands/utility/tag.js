const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const verificarPermissao = require('./verificacao');

const CORES_DISCORD = [
  'Default', 'White', 'Aqua', 'Green', 'Blue', 'Yellow', 'Purple', 'LuminousVividPink', 'Fuchsia',
  'Gold', 'Orange', 'Red', 'Grey', 'Navy', 'DarkAqua', 'DarkGreen', 'DarkBlue', 'DarkPurple',
  'DarkVividPink', 'DarkGold', 'DarkOrange', 'DarkRed', 'DarkGrey', 'DarkerGrey', 'LightGrey',
  'DarkNavy', 'Blurple', 'Greyple', 'DarkButNotBlack', 'NotQuiteBlack', 'Random'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criar-tag')
    .setDescription('Cria uma nova tag (role) entre "Mesas Antigas" e "Tags de Notificação".')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome da nova tag')
        .setRequired(true)
    )
    .addStringOption(option =>
  option.setName('cor')
    .setDescription('Escolha uma cor para a tag')
    .setRequired(false)
    .addChoices(
      { name: 'Default', value: 'Default' },
      { name: 'Red', value: 'Red' },
      { name: 'Blue', value: 'Blue' },
      { name: 'Green', value: 'Green' },
      { name: 'Purple', value: 'Purple' },
      { name: 'Orange', value: 'Orange' },
      { name: 'Yellow', value: 'Yellow' },
      { name: 'Fuchsia', value: 'Fuchsia' },
      { name: 'Gold', value: 'Gold' },
      { name: 'Grey', value: 'Grey' },
      { name: 'Dark Red', value: 'DarkRed' },
      { name: 'Dark Blue', value: 'DarkBlue' },
      { name: 'Dark Green', value: 'DarkGreen' },
      { name: 'Dark Purple', value: 'DarkPurple' },
      { name: 'Random', value: 'Random' },
      { name: 'Personalizada (Hex)', value: 'hex' } // usado para permitir digitar depois
    )
)

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const roleNecessaria = '🤵 ᆞ Gerente';
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.editReply({ content: '❌ Você não tem permissão para usar este comando.' });
    }

    const nomeTag = interaction.options.getString('nome');
    let corInput = interaction.options.getString('cor') || 'Default';
    let corFinal = null;

    // Verifica se é cor padrão do Discord
    if (CORES_DISCORD.includes(corInput)) {
      corFinal = corInput;
    } else {
      // Verifica se é hexadecimal
      if (corInput.startsWith('#')) corInput = corInput.slice(1);

      const isHex = /^([0-9A-Fa-f]{6})$/.test(corInput);
      if (!isHex) {
        return interaction.editReply({ content: '❌ Cor inválida. Use nomes como `Red` ou hexadecimal como `#FF0000`.' });
      }

      corFinal = parseInt(corInput, 16);
    }

    const guild = interaction.guild;
    const roleSuperior = guild.roles.cache.find(r => r.name === '-----ᐃ ‎ ‎ CARGOS‎‎ DO HOTEL ‎ ‎ ‎ ‎ᐃ------------');
    const roleInferior = guild.roles.cache.find(r => r.name === '----------ᐃ ‎ ‎ MESAS JOGADAS ‎ ‎ ‎ ‎ᐃ---------');

    if (!roleSuperior || !roleInferior) {
      return interaction.editReply({ content: '❌ Não encontrei as roles "Mesas Antigas" ou "Tags de Notificação".' });
    }

    const posicaoSuperior = roleSuperior.position;
    const posicaoInferior = roleInferior.position;

    if (posicaoSuperior <= posicaoInferior) {
      return interaction.editReply({ content: '❌ A ordem das roles está invertida. Corrija as posições no servidor.' });
    }

    const novaPosicao = posicaoInferior + 1;

    try {
      const novaRole = await guild.roles.create({
        name: nomeTag,
        color: corFinal,
        reason: `Criada por ${interaction.user.tag} via comando`,
      });

      await novaRole.setPosition(novaPosicao);

      await interaction.editReply(`✅ A tag <@&${novaRole.id}> foi criada com a cor: \`${interaction.options.getString('cor') || 'Default'}\`.`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ Erro ao criar a tag: \`${error.message}\``);
    }
  },
};
