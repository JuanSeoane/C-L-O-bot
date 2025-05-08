const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'data', 'Gurps4E.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add_gurps4e')
    .setDescription('Adiciona uma entrada ao arquivo Gurps4E.json')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome da entrada (ex: Ambidestro)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo (ex: Vantagem, Desvantagem, Perícia)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('descricao')
        .setDescription('Descrição da entrada')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('custo')
        .setDescription('Custo em pontos')
        .setRequired(true)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const tipo = interaction.options.getString('tipo');
    const descricao = interaction.options.getString('descricao');
    const custo = interaction.options.getInteger('custo');

    let data = {};
    try {
      if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao ler o arquivo JSON.', ephemeral: true });
    }

    data[nome] = {
      tipo,
      descricao,
      custo
    };

    try {
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao salvar no JSON.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🆕 ${nome} (${tipo})`)
      .setDescription(descricao)
      .addFields({ name: 'Custo', value: `${custo} pontos`, inline: true })
      .setColor(0x3498db);

    await interaction.reply({ embeds: [embed] });
  }
};
