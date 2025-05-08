const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
const fs = require('fs');
const path = require('path');

// Função para carregar o arquivo JSON com base no sistema escolhido
function carregarSistema(sistema) {
  const caminhoArquivo = path.join(__dirname, '..', '..', 'data', `${sistema}.json`);
  try {
    const dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
    return dados;
  } catch (err) {
    console.error(`Erro ao carregar o arquivo ${sistema}.json:`, err);
    return null;
  }
}

function normalize(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Consulta algo na wiki dos sistemas disponiveis')
    .addStringOption(option =>
      option.setName('sistema')
        .setDescription('Escolha o sistema')
        .setRequired(true)
        .addChoices(
          { name: 'Gurps4E', value: 'sistema1' },
          { name: 'D&D5E', value: 'sistema2' }
        )
    )
    .addStringOption(option =>
      option.setName('termo')
        .setDescription('Nome do termo que deseja consultar')
        .setRequired(true)
    ),

  async execute(interaction) {
    const roleNecessaria = 'everyone'; 
    
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    
      
        
    const sistemasMapeados = {
      sistema1: 'Gurps4E',
      sistema2: 'D&D5E'
    };

    const sistemaKey = interaction.options.getString('sistema');
    const nomeArquivo = sistemasMapeados[sistemaKey];

    if (!nomeArquivo) {
      return interaction.reply('❌ Sistema selecionado inválido.');
    }

    const sistema = carregarSistema(nomeArquivo);
    if (!sistema) {
      return interaction.reply('❌ Sistema não encontrado ou erro ao carregar o sistema.');
    }

    const termoDigitado = normalize(interaction.options.getString('termo'));
    const termoEncontrado = Object.keys(sistema).find(t => normalize(t) === termoDigitado);

    if (termoEncontrado) {
      const resultado = sistema[termoEncontrado];

      const embed = new EmbedBuilder()
        .setTitle(`${termoEncontrado} ${resultado.custo} pts`)
        .setDescription(resultado.descricao)
        .setColor(resultado.tipo === 'Vantagem' ? 'Green' : 'Red')
        .setFooter({ text: resultado.tipo });

      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply(`❌ Não encontrei nada com o termo: \`${termoDigitado}\`.`);
    }
  }
};
