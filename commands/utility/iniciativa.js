const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('iniciativa')
    .setDescription('Inicia uma rolagem de iniciativa do Tormenta20.')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do personagem')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('modificador')
        .setDescription('Modificador de iniciativa')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reiniciar')
        .setDescription('Escreva "sim" para reiniciar a lista de iniciativa')
        .addChoices(
          { name: 'sim', value: 'sim' },
          { name: 'não', value: 'nao' }
        )
        .setRequired(false)),

  async execute(interaction) {
    const roleNecessaria = '🍲 Dungeon Hunter' || '💎ᆞ Diretor'; 
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    const nome = interaction.options.getString('nome');
    const mod = interaction.options.getInteger('modificador');
    const reiniciar = interaction.options.getString('reiniciar');

    // Inicializa a lista se ainda não existir
    if (!interaction.client.iniciativa) {
      interaction.client.iniciativa = [];
    }

    // Se reiniciar for "sim", limpa a lista
    if (reiniciar === 'sim') {
      interaction.client.iniciativa = [];
      await interaction.reply('🔄 A lista de iniciativa foi reiniciada com sucesso.');
      return;
    }

    // Se nome e modificador foram informados, adiciona participante
    if (nome && typeof mod === 'number') {
      interaction.client.iniciativa.push({ nome, mod });
      await interaction.reply(`✅ **${nome}** com modificador **${mod >= 0 ? "+" + mod : mod}** foi adicionado à iniciativa.`);
      return;
    }

    // Caso nenhum argumento, rola a iniciativa
    const lista = interaction.client.iniciativa;

    if (!lista || lista.length === 0) {
      await interaction.reply('⚠️ Nenhum personagem foi adicionado ainda. Use `/iniciativa nome:<nome> modificador:<mod>` para adicionar.');
      return;
    }

    await interaction.reply('🎲 *Rodando os dados... é Hora do Show porra...* 🎲');
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let resultados = [];

    for (const personagem of lista) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + personagem.mod;
  await delay(1500);

  let comentario = '';
  if (d20 === 20) {
     const emojiCritico = '<a:calacainsanaskullinsane:1372952226351288372>'; // use <a:...> se for animado
  comentario = ` > **ACERTO CRÍTICO!** ${emojiCritico}`;
  } else if (d20 === 1) {
    const emojiFalhaCritico = '<a:catthousandyardstarethousandyard:1372955188436144209>'; // use <a:...> se for animado
  comentario = ` > **FALHA CRITICA!** ${emojiFalhaCritico}`;
  }

  await interaction.followUp(`🎲 **${personagem.nome}** rola 1d20 (${d20}) + ${personagem.mod} = **${total}**!${comentario}`);
  resultados.push({ nome: personagem.nome, total });
}

    await delay(2000);

    resultados.sort((a, b) => b.total - a.total);
    let ordem = resultados.map((r, i) => `${i + 1}. **${r.nome}** — ${r.total}`).join('\n');

    await interaction.followUp(`📜 **Ordem de Iniciativa**:\n${ordem}`);

    // Limpa a lista após rolagem
    interaction.client.iniciativa = [];
  }
};
