const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra todos os comandos disponíveis do bot.'),

  async execute(interaction) {
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
      .setTitle('📖 Lista de Comandos Disponíveis')
      .setDescription('Aqui estão todos os comandos que você pode usar:')
      .setColor(0x00bcd4);

    commands.forEach(command => {
      embed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description || 'Sem descrição.',
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
