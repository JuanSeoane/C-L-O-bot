const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('choose')
    .setDescription('Escolhe 🌀 aleatoriamente entre opções separadas por vírgula')
    .addStringOption(option =>
      option.setName('opcoes')
        .setDescription('Digite as opções separadas por vírgula (ex: pão, batata, mel)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('opcoes');
    const opcoes = input
      .split(',')
      .map(op => op.trim())
      .filter(op => op.length > 0);

    if (opcoes.length < 2) {
      return interaction.reply({
        content: '❌ Por favor, forneça **pelo menos duas opções** separadas por vírgula.',
        ephemeral: true
      });
    }

    const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)];

    const embed = new EmbedBuilder()
      .setTitle('🤔 Escolhendo...')
      .setDescription(`A opção escolhida foi:\n\n⏩ **${escolhida}**`)
      .setColor(0x3498DB); // Azul

    await interaction.reply({ embeds: [embed] });
  },
};
