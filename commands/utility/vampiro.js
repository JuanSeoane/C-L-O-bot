const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vampiro')
    .setDescription('Rola dados de Vampiro: A Máscara 🧛 (Storyteller)')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantos dados d10 serão rolados')
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('dificuldade')
        .setDescription('Dificuldade (normalmente entre 2 e 10)')
        .setMinValue(2)
        .setMaxValue(10)
        .setRequired(true)),

  async execute(interaction) {
    const quantidade = interaction.options.getInteger('quantidade');
    const dificuldade = interaction.options.getInteger('dificuldade');

    let sucessos = 0;
    let falhas = 0;
    const resultados = [];

    for (let i = 0; i < quantidade; i++) {
      const roll = Math.floor(Math.random() * 10) + 1;
      if (roll >= dificuldade) {
        sucessos++;
        resultados.push(`✅ **${roll}**`);
      } else {
        falhas++;
        resultados.push(`❌ **${roll}**`);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🧛 Rolagem de Vampiro')
      .addFields(
        { name: '🎲 Dados Rolados', value: resultados.join(', '), inline: false },
        { name: '🟩 Sucessos', value: `${sucessos}`, inline: true },
        { name: '🟥 Falhas', value: `${falhas}`, inline: true }
      )
      .setFooter({ text: `Dificuldade: ${dificuldade}` })
      .setColor(0x8B0000); 

    await interaction.reply({ embeds: [embed] });
  },
};
