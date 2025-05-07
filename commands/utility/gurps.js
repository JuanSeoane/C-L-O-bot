const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gurps')
    .setDescription('Rola 3d6 como no GURPS, com modificador opcional.')
    .addIntegerOption(option =>
      option.setName('modificador')
        .setDescription('Bônus ou ônus (ex: -2, +1)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const roleNecessaria = 'everyone'; // Altere aqui a role permitida
    
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    
       
        
    const mod = interaction.options.getInteger('modificador') || 0;

    // Rola 3 dados de 6 lados
    const dados = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    const total = dados.reduce((a, b) => a + b, 0);
    const final = total + mod;

    let resposta = `🎲 Você rolou: (**${dados.join(', ')}**) Total: ${total}`;
    if (mod !== 0) {
      resposta += `\n🧮 Modificador: ${mod > 0 ? '+' : ''}${mod}`;
      resposta += `\n📊 Resultado final: **${final}**`;
    }

    await interaction.reply(resposta);
  }
};
