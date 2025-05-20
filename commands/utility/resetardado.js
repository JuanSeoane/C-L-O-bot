const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetardado')
    .setDescription('🔥 Reseta os dados para melhor jogadas!'),

  async execute(interaction) {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('🎲 Reiniciando os Dados...')
      .setDescription('Preparando reset...\n')
      .setColor(0xff4500);

    const message = await interaction.editReply({ embeds: [embed], fetchReply: true });

    const etapas = 5;
    const delay = 150;

    for (let i = 0; i < etapas; i++) {
      const numeros = Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 1);
      embed.setDescription(`🔥 Reaqueçendo os dados...\n ${numeros.join(', ')}`);
      await message.edit({ embeds: [embed] });
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    embed
      .setTitle('✅ Dados Resetados com Sucesso!')
      .setDescription('🔥 Estou pronto para novas rodagens.')
      .setColor(0x2ecc71);

    await message.edit({ embeds: [embed] });
  },
};
