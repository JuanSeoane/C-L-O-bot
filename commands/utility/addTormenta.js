const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtormenta')
    .setDescription('Adiciona um item à base de dados de Tormenta20.')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do item')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('descricao')
        .setDescription('Descrição do item')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('imagem')
        .setDescription('URL da imagem (opcional)')
        .setRequired(false)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const descricao = interaction.options.getString('descricao') || 'Sem descrição.';
    const imagem = interaction.options.getString('imagem');

    const filePath = path.resolve(__dirname, '../../data/Tormenta20.json');

    let dados = {};
    try {
      if (fs.existsSync(filePath)) {
        const conteudo = fs.readFileSync(filePath, 'utf-8');
        dados = JSON.parse(conteudo);
      }
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao ler o arquivo JSON.', ephemeral: true });
    }

    if (dados[nome]) {
      return interaction.reply({ content: `❌ O item **${nome}** já existe.`, ephemeral: true });
    }

    dados[nome] = { descricao };
    if (imagem) dados[nome].imagem = imagem;

    try {
      fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao salvar o item.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📘 ${nome}`)
      .setDescription(descricao)
      .setColor(0xb02b2e);

    if (imagem) {
      embed.setImage(imagem);
    }

    return interaction.reply({ content: `✅ Item **${nome}** adicionado com sucesso.`, embeds: [embed] });
  },
};
