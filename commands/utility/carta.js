const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
const naipes = ['♠️ Espadas', '♥️ Copas', '♦️ Ouros', '♣️ Paus'];
const valores = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', '🔱 Valete', '💎 Dama', '👑 Rei'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('carta')
    .setDescription('Puxa uma carta aleatória de um baralho (incluindo coringa)'),
  
  async execute(interaction) {
    const roleNecessaria = 'everyone'; // Altere aqui a role permitida
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    
  
    let carta;

    // 1 em 27 chance de ser coringa (2 coringas em 54 cartas)
    if (Math.random() < 2 / 54) {
      carta = '🎭 Coringa';
    } else {
      const valor = valores[Math.floor(Math.random() * valores.length)];
      const naipe = naipes[Math.floor(Math.random() * naipes.length)];
      carta = `${valor} de ${naipe}`;
    }

    const embed = new EmbedBuilder()
      .setTitle('🃏 Sua carta:')
      .setDescription(`**${carta}**`)
      .setColor('Random');

    await interaction.reply({ embeds: [embed] });
  }
};
