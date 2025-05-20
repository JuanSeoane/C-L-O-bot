const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adddnd')
    .setDescription('Adiciona um termo ao arquivo D&D 5E.')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do termo (ex: Mago)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo do termo (Classe, Raça, Magia, etc.)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('descricao')
        .setDescription('Descrição do termo')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('imagem')
        .setDescription('URL da imagem ilustrativa (opcional)')
        .setRequired(false)),

  async execute(interaction) {
    const roleNecessaria = 'Bibliotecario D&D';
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const nome = interaction.options.getString('nome');
    const tipo = interaction.options.getString('tipo');
    const descricao = interaction.options.getString('descricao');
    const imagem = interaction.options.getString('imagem');

    const filePath = path.resolve(__dirname, '../../data/D&D5E.json');

    // Lê o arquivo existente
    let dados = {};
    try {
      if (fs.existsSync(filePath)) {
        const conteudo = fs.readFileSync(filePath, 'utf-8');
        dados = JSON.parse(conteudo);
      }
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao ler o arquivo JSON.', ephemeral: true });
    }

    // Verifica se o termo já existe
    if (dados[nome]) {
      return interaction.reply({ content: `❌ O termo **${nome}** já existe no arquivo.`, ephemeral: true });
    }

    // Cria o novo termo
    dados[nome] = {
      tipo,
      descricao
    };

    if (imagem) {
      dados[nome].imagem = imagem;
    }

    // Salva no arquivo
    try {
      fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (err) {
      return interaction.reply({ content: '❌ Erro ao salvar o termo no arquivo JSON.', ephemeral: true });
    }

    return interaction.reply(`✅ O termo **${nome}** foi adicionado com sucesso ao wiki de D&D 5E.`);
  }
};
