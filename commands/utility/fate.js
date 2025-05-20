const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
    data: new SlashCommandBuilder()
      .setName('fate')
      .setDescription('Roda 4 dados no estilo do sistema 🃏 FATE.'),
      async execute(interaction) {
        const roleNecessaria = '👤ᆞHospede'; 
            if (!verificarPermissao(interaction, roleNecessaria)) {
              return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
            }
            const simbolos = ['+', '+', '0', '0', '-', '-'];
    const simboloToEmoji = {
      '+': '✳️',
      '0': '⚪️',
      '-': '⛔',
    };

    // Rolar 4 dados FATE
    const resultados = Array.from({ length: 4 }, () => {
      const face = simbolos[Math.floor(Math.random() * simbolos.length)];
      return face;
    });

 
    const resultadoEmojis = resultados.map(s => simboloToEmoji[s]).join(' ');
    const total = resultados.reduce((acc, val) => {
      if (val === '+') return acc + 1;
      if (val === '-') return acc - 1;
      return acc;
    }, 0);

    const embed = new EmbedBuilder()
      .setTitle('🎲 Rolar Dados FATE')
      .setDescription(`Resultados: ${resultadoEmojis}\n\nTotal: **${total > 0 ? '+' : ''}${total}**`)
      .setColor(0x5865F2); 

    await interaction.reply({ embeds: [embed] });
  }
};