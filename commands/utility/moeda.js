const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('moeda')
    .setDescription('Joga uma moeda e retorna cara 🪙 ou coroa 👑'),

  async execute(interaction) {
    const roleNecessaria = '👤ᆞHospede'; 
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    const resultado = Math.random() < 0.5 ? { texto: '# Cara', emoji: '🪙' } : { texto: '# Coroa', emoji: '👑' };

    const embed = new EmbedBuilder()
      .setTitle('Resultado do lançamento da moeda')
      .setDescription(`**${resultado.texto} ${resultado.emoji}**`)
      .setColor(0xF1C40F); // Amarelo (hex equivalente)

    await interaction.reply({ embeds: [embed] });
  },
};
