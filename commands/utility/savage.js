const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('savage')
    .setDescription('Rola um dado de 🔰 Savage Worlds com modificador e mostra o dado selvagem.')
    .addStringOption(opt =>
      opt.setName('dado')
        .setDescription('Tipo de dado (ex: d4, d6, d8, d10, d12)')
        .setRequired(true)
        .addChoices(
          { name: 'd4', value: '4' },
          { name: 'd6', value: '6' },
          { name: 'd8', value: '8' },
          { name: 'd10', value: '10' },
          { name: 'd12', value: '12' }
        ))
    .addIntegerOption(opt =>
      opt.setName('modificador')
        .setDescription('Modificador adicional (positivo ou negativo)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const dado = parseInt(interaction.options.getString('dado'));
    const mod = interaction.options.getInteger('modificador') || 0;

    function rolarExploding(dado) {
      let total = 0;
      let roll;
      do {
        roll = Math.floor(Math.random() * dado) + 1;
        total += roll;
      } while (roll === dado);
      return total;
    }

    const rolagemPrincipal = rolarExploding(dado);
    const rolagemSelvagem = rolarExploding(6);

    const total = rolagemPrincipal + mod;

    let resultadoTexto;
    if (total >= 4) {
      const ampliacoes = Math.floor((total - 4) / 4);
      resultadoTexto = ampliacoes > 0
        ? `✅ **Sucesso com ${ampliacoes} ampliação${ampliacoes > 1 ? 'es' : ''}!**`
        : '✅ **Sucesso!**';
    } else {
      resultadoTexto = '❌ **Falha.**';
    }

    const embed = new EmbedBuilder()
      .setTitle('🎲 Rolagem Savage Worlds')
      .addFields(
        { name: `Dado principal (1d${dado})`, value: `**${rolagemPrincipal}**`, inline: true },
        { name: `Dado selvagem (1d6)`, value: `**${rolagemSelvagem}** `, inline: true },
        { name: 'Modificador', value: `${mod >= 0 ? '+' : ''}${mod}`, inline: true },
        { name: 'Total da Rolagem', value: `**${rolagemPrincipal} + ${mod} = ${total}**`, inline: false },
        { name: 'Resultado', value: resultadoTexto }
      )
      .setColor(0xF1C40F); // amarelo

    await interaction.reply({ embeds: [embed] });
  },
};
