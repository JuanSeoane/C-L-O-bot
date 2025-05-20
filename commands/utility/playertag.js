const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playertag')
    .setDescription('Concede uma tag de mesa para um jogador.')
    .addRoleOption(option =>
      option.setName('tag')
        .setDescription('Tag da mesa a ser atribuída')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('jogador')
        .setDescription('Jogador que receberá a tag')
        .setRequired(true)
    ),

  async execute(interaction) {
    const roleGerente = '〽️ ᆞ Mestre da Casa'; // Role de Gerente/Mestre
    const delimitadorInicio = '-----ᐃ ‎ ‎ CARGOS‎‎ DO HOTEL ‎ ‎ ‎ ‎ᐃ------------';
    const delimitadorFim = '----------ᐃ ‎ ‎ MESAS JOGADAS ‎ ‎ ‎ ‎ᐃ---------';

    const membroExecutor = interaction.member;
    const jogador = interaction.options.getMember('jogador');
    const tagSelecionada = interaction.options.getRole('tag');

    // Verifica se a tag selecionada existe
    if (!tagSelecionada) {
      return interaction.reply({
        content: '❌ A tag selecionada não foi encontrada.',
        ephemeral: true,
      });
    }

    const todasAsRoles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position);
    const posInicio = todasAsRoles.find(r => r.name === delimitadorInicio)?.position;
    const posFim = todasAsRoles.find(r => r.name === delimitadorFim)?.position;

    // Verifica se os delimitadores de roles estão configurados corretamente
    if (!posInicio || !posFim) {
      return interaction.reply({
        content: '⚠️ Somente as tags de mesas podem ser dadas.',
        ephemeral: true,
      });
    }

    // Verifica se a tag está entre os delimitadores
    if (!(tagSelecionada.position < posInicio && tagSelecionada.position > posFim)) {
      return interaction.reply({
        content: '❌ A tag selecionada não está entre as tags de mesa permitidas.',
        ephemeral: true,
      });
    }

    // Verifica se o executor possui a role de "mestre" ou "gerente" ou se possui a tag de mesa
    const temPermissaoDeGerente = verificarPermissao(interaction, roleGerente);
    const temTagDeMesa = membroExecutor.roles.cache.has(tagSelecionada.id);

    if (!temPermissaoDeGerente && !temTagDeMesa) {
      return interaction.reply({
        content: '❌ Você só pode dar a tag que possui ou ser gerente.',
        ephemeral: true,
      });
    }

    try {
      // Atribui a tag ao jogador
      await jogador.roles.add(tagSelecionada);
      await interaction.reply(`✅ ${jogador.user} agora tem a tag <@&${tagSelecionada.id}>`);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao atribuir a tag ao jogador.',
        ephemeral: true,
      });
    }
  },
};
