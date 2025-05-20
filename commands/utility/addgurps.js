const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addgurps')
    .setDescription('Adiciona um termo ao arquivo GURPS 4e.')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do termo (ex: Ambidestro)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo do termo')
        .setRequired(true)
        .addChoices(
          { name: 'Vantagem', value: 'Vantagem' },
          { name: 'Desvantagem', value: 'Desvantagem' },
          { name: 'Perícia', value: 'Perícia' }
        ))
    .addStringOption(option =>
      option.setName('descricao')
        .setDescription('Descrição do termo')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('custo')
        .setDescription('Quanto ele custa')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('atributo_e_dificuldade')
        .setDescription('Atributo e dificuldade (para Perícias)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('ampliacoes')
        .setDescription('Ampliações (opcional)')),

  async execute(interaction) {
    const roleNecessaria = 'Bibliotecario GURPS';
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const nome = interaction.options.getString('nome');
    const tipo = interaction.options.getString('tipo');
    const descricao = interaction.options.getString('descricao');
    const custo = interaction.options.getString('custo');
    const atributoEDificuldade = interaction.options.getString('atributo_e_dificuldade');
    const ampliacoes = interaction.options.getString('ampliacoes');

    const filePath = path.resolve(__dirname, '../../data/Gurps4E.json');

    let dados = {};
    try {
      if (fs.existsSync(filePath)) {
        const conteudo = fs.readFileSync(filePath, 'utf-8');
        dados = JSON.parse(conteudo);
      }
    } catch (err) {
      return interaction.reply({ content: 'Erro ao ler o arquivo JSON.', ephemeral: true });
    }

    if (dados[nome]) {
      return interaction.reply({ content: `❌ O termo **${nome}** já existe no arquivo.`, ephemeral: true });
    }

    const termo = {
      tipo,
      descricao
    };

    if (tipo === 'Perícia' && atributoEDificuldade) {
      termo.atributo_e_dificuldade = atributoEDificuldade;
    } else if ((tipo === 'Vantagem' || tipo === 'Desvantagem') && custo) {
      termo.custo = parseInt(custo);
    }

    if (ampliacoes) {
      termo.ampliacoes = ampliacoes;
    }

    dados[nome] = termo;

    try {
      fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf-8');
    } catch (err) {
      return interaction.reply({ content: 'Erro ao salvar o termo no arquivo JSON.', ephemeral: true });
    }

    // Embed de resposta com cor por tipo
    const corEmbed = tipo === 'Vantagem' ? 0x2ecc71 : tipo === 'Desvantagem' ? 0xe74c3c : 0x3498db;
    const embed = new EmbedBuilder()
      .setTitle(`📘 ${nome} (${tipo})`)
      .setDescription(descricao)
      .setColor(corEmbed);

    if (tipo === 'Perícia') {
      embed.addFields({ name: '🎯 Atributo e Dificuldade', value: atributoEDificuldade || 'Não especificado' });
    } else {
      embed.addFields({ name: '💰 Custo', value: custo ? `${custo}` : 'Não especificado' });
    }

    if (ampliacoes) {
      embed.addFields({ name: '📌 Ampliações', value: ampliacoes });
    }

    return interaction.reply({ content: `✅ Termo adicionado com sucesso.`, embeds: [embed] });
  },
};
