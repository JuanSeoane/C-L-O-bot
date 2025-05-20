const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dado-secreto')
    .setDescription('Faz uma rolagem secreta (visível apenas para você).')
    .addStringOption(option =>
      option.setName('expressao')
        .setDescription('Expressão de dados, ex: 1d20+5')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('anotacao')
        .setDescription('Descrição opcional da rolagem (ex: ataque com espada)')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const input = interaction.options.getString('expressao').trim();
    const anotacao = interaction.options.getString('anotacao') || '';

    // Suporte a múltiplas rolagens tipo 2#1d6+3
    const multiMatch = input.match(/^(\d+)#(.+)$/);
    const multi = multiMatch ? parseInt(multiMatch[1]) : 1;
    const baseInput = multiMatch ? multiMatch[2] : input;

    if (!/^\d*d\d+([+\-*/]\d*d?\d+)*$/.test(baseInput)) {
      return interaction.reply({ content: '❌ Expressão inválida.', ephemeral: true });
    }

    const partes = baseInput.match(/[+\-*/]?[^+\-*/]+/g);
    if (!partes) {
      return interaction.reply({ content: '❌ Não foi possível interpretar os dados.', ephemeral: true });
    }

    const resultados = [];

    for (let i = 0; i < multi; i++) {
      let totalFinal = 0;
      let detalhes = [];
      let operacaoAnterior = '+';

      for (let parte of partes) {
        const operador = parte[0].match(/[+\-*/]/) ? parte[0] : operacaoAnterior;
        parte = parte[0].match(/[+\-*/]/) ? parte.slice(1) : parte;
        operacaoAnterior = operador;

        let valor = 0;

        if (/^\d*d\d+$/.test(parte)) {
          const [qtdStr, facesStr] = parte.split('d');
          const qtd = parseInt(qtdStr || '1');
          const faces = parseInt(facesStr);
          if (qtd > 100 || faces > 1000) {
            return interaction.reply({ content: '❌ Muitos dados ou faces.', ephemeral: true });
          }

          const rolls = Array.from({ length: qtd }, () => Math.floor(Math.random() * faces) + 1);
          const destaque = rolls.map(v => v === Math.min(...rolls) ? `**${v}**` : `${v}`);
          valor = rolls.reduce((a, b) => a + b, 0);
          detalhes.push(`[${destaque.join(', ')}]`);
        } else if (/^\d+$/.test(parte)) {
          valor = parseInt(parte);
          detalhes.push(`${valor}`);
        } else {
          return interaction.reply({ content: `❌ Erro ao interpretar: \`${parte}\``, ephemeral: true });
        }

        switch (operador) {
          case '+': totalFinal += valor; break;
          case '-': totalFinal -= valor; break;
          case '*': totalFinal *= valor; break;
          case '/': totalFinal = valor === 0 ? 0 : totalFinal / valor; break;
        }
      }

      resultados.push(`\` ${Math.round(totalFinal)} \` ⟵ 📊 ${detalhes.join(' ')} 🎲${baseInput}`);
    }

    let respostaFinal = resultados.join('\n');
    if (anotacao) {
      respostaFinal = `\`*${anotacao}*\`\n${respostaFinal}`;
    }

    await interaction.reply({ content: respostaFinal, ephemeral: true });
  }
};
