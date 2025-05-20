const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('import-dnd')
    .setDescription('Importa uma ficha de D&D 5e em PDF')
    .addAttachmentOption(option =>
      option.setName('arquivo')
        .setDescription('Arquivo da ficha em PDF')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const file = interaction.options.getAttachment('arquivo');

    if (!file.name.endsWith('.pdf')) {
      return interaction.editReply({ content: 'Por favor, envie um arquivo `.pdf` válido.', ephemeral: true });
    }

    try {
      // Download do PDF
      const res = await fetch(file.url);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log('PDF carregado com tamanho:', buffer.length);

      // Salva temporariamente o PDF para leitura local
      const tempPath = path.join(__dirname, '..', '..', 'data', `temp-${Date.now()}.pdf`);
fs.writeFileSync(tempPath, buffer);
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataReady', async (pdfData) => {
        console.log('PDF data pronto! Verificando estrutura...');
        console.dir(Object.keys(pdfData), { depth: 1 });

        const pages = pdfData?.Pages;
        if (!pages || !Array.isArray(pages)) {
          console.error('PDF não tem páginas válidas:', pages);
          return interaction.editReply({ content: 'O PDF não possui estrutura de páginas válida.', ephemeral: true });
        }

        const fields = [];
        for (const page of pages) {
          if (page?.Fields && Array.isArray(page.Fields)) {
            fields.push(...page.Fields);
            console.log('Todos os campos disponíveis:');
fields.forEach(f => {
  if (f?.id?.Id) console.log(f.id.Id);
});
          }
        }

        if (fields.length === 0) {
          console.error('Nenhum campo encontrado no PDF.');
          return interaction.editReply({ content: 'Campos do PDF não encontrados.', ephemeral: true });
        }

        console.log(`Total de campos encontrados: ${fields.length}`);

        // Função auxiliar para buscar valores por ID
        const getField = (id) => {
          const field = fields.find(f => f.id?.Id?.toLowerCase() === id.toLowerCase());
          return field?.V?.trim() || '—';
        };

        // Montar o embed
        const character = {
          nome: getField('Nome_do_Personagem'),
          classe: getField('Classe_e_N_vel'),
          raca: getField('Ra_a'),
          alinhamento: getField('Tend_ncia'),
          antecedente: getField('Antecedente'),
          jogador: getField('Nome_do_Jogador'),
          pv: getField('PV'),
          ca: getField('CA'),
          deslocamento: getField('Deslocamento'),
          iniciativa: getField('Iniciativa'),
          inspiracao: getField('Inspiracao'),
          for: getField('STR'),
          formod: getField('STRmod'),
          des: getField('DEX'),
          desmod: getField('DEXmod'),
          con: getField('CON'),
          conmod: getField('CONmod'),
          int: getField('INT'),
          intmod: getField('INTmod'),
          sab: getField('WIS'),
          sabmod: getField('WISmod'),
          car: getField('CHA'),
          carmod: getField('CHAmod'),
          idiomas: getField('Idiomas'),
          instrumentos: getField('Instrumentos'),
          habilidades: getField('Habilidades_de_Classe'),
          equipamento: getField('Equipamento'),
          magias: getField('Magias'),
          historia: getField('Hist_ria'),
          ideais: getField('Ideais'),
          ligacoes: getField('Liga__es'),
          defeitos: getField('Defeitos')
        };

        const embed = new EmbedBuilder()
          .setTitle(`📘 Ficha de Personagem: ${character.nome}`)
          .setDescription(`🎭 Classe: ${character.classe}\n🧝 Raça: ${character.raca}\n⚖️ Tendência: ${character.alinhamento}\n🏴 Antecedente: ${character.antecedente}\n🙋 Nome do Jogador: ${character.jogador}\n❤️ PV Totais: ${character.pv}\n🎯 Iniciativa: ${character.iniciativa} | Deslocamento: ${character.deslocamento}\n🛡️ CA: ${character.ca}\n💡 Inspiração: ${character.inspiracao}`)
          .addFields(
            {
              name: '💪 Atributos',
              value: `- Força: ${character.for}\n- Destreza: ${character.des}\n- Constituição: ${character.con}\n- Inteligência: ${character.int}\n- Sabedoria: ${character.sab}\n- Carisma: ${character.car}`,
              inline: false
            },
            {
              name: '✨ Habilidades de Classe',
              value: character.habilidades || '—',
              inline: false
            },
            {
              name: '🧠 Idiomas',
              value: character.idiomas || '—',
              inline: true
            },
            {
              name: '🎵 Instrumentos',
              value: character.instrumentos || '—',
              inline: true
            },
            {
              name: '📦 Equipamento',
              value: character.equipamento || '—',
              inline: false
            },
            {
              name: '🔮 Magias Conhecidas',
              value: character.magias || '—',
              inline: false
            },
            {
              name: '📖 História',
              value: character.historia || '—',
              inline: false
            },
            {
              name: '☠️ Ideais',
              value: character.ideais || '—',
              inline: true
            },
            {
              name: '🪢 Ligações',
              value: character.ligacoes || '—',
              inline: true
            },
            {
              name: '🔥 Defeitos',
              value: character.defeitos || '—',
              inline: true
            }
          )
          .setColor(0x5c6bc0)
          .setFooter({ text: 'Importado automaticamente do PDF' });

        return interaction.editReply({ embeds: [embed] });
      });

      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('Erro no pdfParser:', errData.parserError);
        interaction.editReply({ content: 'Erro ao analisar o PDF.', ephemeral: true });
      });

      pdfParser.loadPDF(pdfPath);

    } catch (err) {
      console.error('Erro detalhado ao processar o PDF:', err);
      return interaction.editReply({
        content: `Erro ao processar o PDF:\n\`\`\`${err.message}\`\`\``,
        ephemeral: true
      });
    }
  }
};
