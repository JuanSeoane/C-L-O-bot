const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gurps')
    .setDescription('Rola 3d6 como no 🗿 GURPS.'),
  async execute(interaction) {
    const roleNecessaria = '👤ᆞHospede'; 
    
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }       
    // Rola 3 dados de 6 lados
    const dados = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    const total = dados.reduce((a, b) => a + b, 0);
    let resposta = `🎲 Você rolou: (**${dados.join(', ')}**) Total: ${total}`;
    

    await interaction.reply(resposta);
  }
};
