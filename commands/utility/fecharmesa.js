const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const verificarPermissao = require('./verificacao');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fechar-mesa')
    .setDescription('Fecha uma mesa: apaga todos os canais da categoria exceto o mais antigo, que vai pro cemitério.')
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Nome da categoria da mesa')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const roleNecessaria = '🤵 ᆞ Gerente';
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const nomeCategoria = interaction.options.getString('categoria');
    const guild = interaction.guild;

    const categoria = guild.channels.cache.find(
      ch => ch.type === ChannelType.GuildCategory && ch.name === nomeCategoria
    );

    if (!categoria) {
      return interaction.editReply({ content: `❌ Categoria "${nomeCategoria}" não encontrada.` });
    }

    // Coletar os canais da categoria e ordenar por data
    const canaisDaCategoria = guild.channels.cache
      .filter(ch => ch.parentId === categoria.id)
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const canalMaisAntigo = canaisDaCategoria.find(ch => ch.type === ChannelType.GuildText);
    if (!canalMaisAntigo) {
      return interaction.editReply({ content: `❌ Nenhum canal de texto encontrado na categoria.` });
    }

    // Buscar ou criar a categoria do cemitério
    let cemiterio = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name === '🔴💀 Cemiterio de mesas'
    );

    if (!cemiterio) {
      cemiterio = await guild.channels.create({
        name: '🪦 ᆞ Cemitério de Mesas',
        type: ChannelType.GuildCategory,
        reason: 'Categoria de arquivamento de mesas encerradas'
      });
    }

    // Mover canal mais antigo
    await canalMaisAntigo.setParent(cemiterio.id).catch(err => console.error("Erro ao mover canal:", err));

    // Deletar os demais canais
    const canaisParaDeletar = canaisDaCategoria.filter(c => c.id !== canalMaisAntigo.id);
    for (const canal of canaisParaDeletar.values()) {
      try {
        await canal.delete();
      } catch (error) {
        console.error(`Erro ao deletar canal ${canal.name}:`, error);
      }
    }

    // Esperar um pouco para garantir que todos foram deletados antes de excluir a categoria
    setTimeout(async () => {
      try {
        await categoria.delete();
      } catch (error) {
        console.error(`Erro ao deletar categoria ${categoria.name}:`, error);
      }
    }, 1000); // Delay leve para segurança

    await interaction.editReply(`✅ A mesa **${nomeCategoria}** foi encerrada! O canal ${canalMaisAntigo} foi movido para o cemitério.`);
  },
};
