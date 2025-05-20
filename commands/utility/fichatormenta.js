const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fichatormenta')
    .setDescription('Gera atributos para uma ficha de Tormenta 20.')
    .addStringOption(option =>
      option.setName('modo')
        .setDescription('Modo de geração de atributos')
        .setRequired(true)
        .addChoices(
          { name: 'Clássico', value: 'classico' },
          { name: 'Épico', value: 'epico' }
        )
    ),
  async execute(interaction) {
    const modo = interaction.options.getString('modo');
    const atributos = ['Dado 1', 'Dado 2', 'Dado 3', 'Dado 4', 'Dado 5', 'Dado 6'];
    const resultados = [];

    function rolarDado(lados) {
      return Math.floor(Math.random() * lados) + 1;
    }

    for (let i = 0; i < 6; i++) {
      let dados = [rolarDado(6), rolarDado(6), rolarDado(6)];
      let valor;

      if (modo === 'classico') {
        const soma = dados.reduce((a, b) => a + b, 0);
        valor = Math.floor((soma - 10) / 2);
      } else if (modo === 'epico') {
        const menor = Math.min(...dados);
        const indexMenor = dados.indexOf(menor);

        const dadosModificados = [...dados];
        dadosModificados[indexMenor] = 6;

        const total = dadosModificados.reduce((a, b) => a + b, 0);
        valor = Math.floor((total - 10) / 2);
        dados = dadosModificados;
      }

      resultados.push({ atributo: atributos[i], valor, dados });
    }

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Geração de Atributos - Tormenta 20')
      .setDescription(`Modo de geração: **${modo === 'classico' ? 'Clássico' : 'Épico'}**`)
      .setColor(modo === 'classico' ? 0x2ecc71 : 0xe67e22);

    resultados.forEach((res) => {
      embed.addFields({
        name: `🎲 ${res.atributo}`,
        value: `Dados: [${res.dados.join(', ')}] → **${res.valor}**`,
        inline: true
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
