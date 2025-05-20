const { SlashCommandBuilder, EmbedBuilder , ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
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

function criarSelectMagias(magiasObj) {
  // magiasObj é um objeto com as magias, ou o texto dentro do "descricao"
  // A suposição é que magias estejam em descricao, separados por linhas
  // Exemplo: "Abençoar Alimentos\nAcalmar Animal\nAçoite Flamejante\n..."
  const magiasRaw = magiasObj.descricao || '';
  const linhas = magiasRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  // Limitar opções a 25 por select (limite do discord)
  const options = linhas.slice(0, 25).map(magia => ({
    label: magia.length > 100 ? magia.slice(0, 97) + '...' : magia,
    value: normalize(magia),
  }));

  return new StringSelectMenuBuilder()
    .setCustomId('select-magia')
    .setPlaceholder('Selecione uma magia')
    .addOptions(options);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Consulta algo na wiki dos sistemas disponíveis')
    .addStringOption(option =>
      option.setName('sistema')
        .setDescription('Escolha o sistema')
        .setRequired(true)
        .addChoices(
          { name: 'Gurps4E', value: 'sistema1' },
          { name: 'D&D5E', value: 'sistema2' },
          { name: 'Tormenta20', value: 'sistema3' }
        )
    )
    .addStringOption(option =>
      option.setName('termo')
        .setDescription('Nome do termo que deseja consultar')
        .setRequired(true)
    ),

  async execute(interaction) {
         if (interaction.isStringSelectMenu()) {
          try {
      const sistema = carregarSistema('Tormenta20');
      if (!sistema) return interaction.reply({ content: 'Erro ao carregar Tormenta20.', ephemeral: true });

      if (interaction.customId === 'select-circulo') {
        const circuloSelecionado = interaction.values[0]; // ex: 'círculo_1_PM'

        const embedMagias = new EmbedBuilder()
          .setTitle(`🔮 Magias do ${circuloSelecionado.replace('_PM', '').replace('_', 'º ')}`)
          .setDescription('Selecione a magia no menu abaixo para ver detalhes.')
          .setColor(0xb02b2e);

        const selectMagias = criarSelectMagias(sistema[circuloSelecionado]);

        const rowMagias = new ActionRowBuilder().addComponents(selectMagias);

        await interaction.update({ embeds: [embedMagias], components: [rowMagias] });
        return;
      }

      if (interaction.customId === 'select-magia') {
        const magiaSelecionada = interaction.values[0];

        let magiaAchada = null;
        for (const circulo of ['círculo_1_PM', 'círculo_2_PM', 'círculo_3_PM', 'círculo_4_PM', 'círculo_5_PM']) {
          const magiasRaw = sistema[circulo]?.descricao || '';
          const linhas = magiasRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          for (const linha of linhas) {
            if (normalize(linha) === magiaSelecionada) {
              magiaAchada = linha;
              break;
            }
          }
          if (magiaAchada) break;
        }

        if (!magiaAchada) {
          await interaction.update({ content: 'Magia não encontrada.', components: [], embeds: []});
          return;
        }

        const detalhesMagia = sistema[magiaAchada]?.descricao || 'Descrição detalhada não disponível.';

        const embedDetalhes = new EmbedBuilder()
          .setTitle(`✨ ${magiaAchada}`)
          .setDescription(detalhesMagia)
          .setColor(0xb02b2e);

        await interaction.update({ embeds: [embedDetalhes], components: [] });
        return;
      }
    } catch (error) {
      console.error('Erro no select menu:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ocorreu um erro ao processar sua seleção.'});
      }
    }
  
    }


    const roleNecessaria = '👤ᆞHospede'; 
    
    if (!verificarPermissao(interaction, roleNecessaria)) {
      return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
    }

    const sistemasMapeados = {
      sistema1: 'Gurps4E',
      sistema2: 'D&D5E',
      sistema3: 'Tormenta20'
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

    if (!termoEncontrado) {
      return interaction.reply(`❌ Termo **${interaction.options.getString('termo')}** não encontrado no sistema ${nomeArquivo}.`);
    }
     if (nomeArquivo === 'Tormenta20' && termoDigitado === 'magias') {
      const embedInicial = new EmbedBuilder()
        .setTitle('📖 Magias do Tormenta20')
        .setDescription(
          'Aqui estão todas as magias do Tormenta20.\n\n' +
          '**1º Círculo** – Magias básicas e iniciais\n' +
          '**2º Círculo** – Magias intermediárias\n' +
          '**3º Círculo** – Magias avançadas\n' +
          '**4º Círculo** – Magias poderosas\n' +
          '**5º Círculo** – Magias lendárias\n\n' +
          'Selecione um círculo mágico no menu abaixo para começar.'
        )
        .setColor(0xb02b2e);

      const selectCirculos = new StringSelectMenuBuilder()
        .setCustomId('select-circulo')
        .setPlaceholder('Selecione um círculo de magia')
        .addOptions([
          { label: '1º Círculo', value: 'círculo_1_PM' },
          { label: '2º Círculo', value: 'círculo_2_PM' },
          { label: '3º Círculo', value: 'círculo_3_PM' },
          { label: '4º Círculo', value: 'círculo_4_PM' },
          { label: '5º Círculo', value: 'círculo_5_PM' },
        ]);

      const rowCirculos = new ActionRowBuilder().addComponents(selectCirculos);

      return interaction.reply({ embeds: [embedInicial], components: [rowCirculos] });
    }
    const resultado = sistema[termoEncontrado];

    // Define o título de forma segura, só adiciona info extra se existir
    const infoExtra = resultado.custo || resultado.atributo_e_dificuldade || '';
    const titulo = infoExtra ? `${termoEncontrado} (${infoExtra} pts)` : termoEncontrado;
    let corEmbed;

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(resultado.descricao || 'Sem descrição disponível.')
      .setColor(
        nomeArquivo === 'Tormenta20' ? 0xb02b2e :
        resultado.tipo === 'Vantagem' ? 'Green' :
        resultado.tipo === 'Desvantagem' ? 'Red' :
        resultado.tipo === 'Perícia' ? 'Blue' :
        resultado.tipo === 'Classe' ? 'Purple' :
        'Grey'
      )
      .setFooter({ text: resultado.tipo || 'Hotel dos Parças™ ©' });

    if (resultado.ampliacoes) {
      for (const [nome, texto] of Object.entries(resultado.ampliacoes)) {
        embed.addFields({ name: nome, value: texto });
      }
    }

    if (resultado.imagem) {
      embed.setImage(resultado.imagem);
    }

    return interaction.reply({ embeds: [embed] });
  },
};
