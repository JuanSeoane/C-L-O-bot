const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Mostra todos os comandos disponíveis, organizados por categoria'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Menu de Ajuda')
      .setDescription('Aqui estão os comandos disponíveis organizados por categoria.')
      .setColor(0x00bcd4)
      .addFields(
        {
          name: '🛠️ Comandos Úteis para Todo mundo',
          value: [
            '`/ajuda` – Mostra todos os comandos disponíveis do bot.',
            '`/carta` – Puxa uma carta aleatória de um baralho ♣️♥️ (incluindo coringa)',
            '`/choose` – Escolhe 🌀 aleatoriamente entre opções separadas por vírgula',
            '`/moeda` – Joga uma moeda e retorna cara 🪙 ou coroa 👑',
            '`/npc` – Gera um 🌐 NPC aleatório com nome, idade, gênero e uma característica marcante',
            '`/timer` – Inicia um timer regressivo 🕐 (um por canal)'
          ].join('\n')
        },
        {
          name: '🛡️ Comandos da Moderação',
          value: [
            '`/adddnd` – Adiciona um termo ao arquivo D&D 5E.',
            '`/addgurps` – Adiciona um termo ao arquivo GURPS 4e.',
            '`/addtormenta` – Adiciona um item à base de dados de Tormenta20',
            '`/cargo-emoji` – Mensagem para ganhar cargos ao reagir',
            '`/criar-mesa` – Cria uma categoria privada com um canal de texto e voz para uma mesa.',
            '`/criar-tag` – Cria uma nova tag (role) entre "Mesas Antigas" e "Tags de Notificação".',
            '`/fechar-mesa` – Fecha uma mesa: apaga todos os canais da categoria exceto o mais antigo, que vai pro cemitério.'
          ].join('\n')
        },
        {
          name: '🎲 Comandos para Mestres e Players',
          value: [
            '`/dado-secreto` – Faz uma rolagem secreta (visível apenas para você).',
            '`/fate` – Roda 4 dados no estilo do sistema 🃏 FATE.',
            '`/fichatormenta` – Gera atributos para uma ficha de Tormenta 20.',
            '`/gurps` – Rola 3d6 como no 🗿 GURPS',
            '`/importar-ficha` – Importe uma ficha GURPS (.gcs JSON)',
            '`/iniciativa` – Inicia uma rolagem de iniciativa do Tormenta20.',
            '`/playertag` – Concede uma tag de mesa para um jogador.',
            '`/resetardado` – 🔥 Reseta os dados para melhor jogadas!',
            '`/savage` – Rola um dado de 🔰 Savage Worlds com modificador e mostra o dado selvagem',
            '`/vampiro` – Rola dados de Vampiro: A Máscara 🧛 (Storyteller)',
            '`/wiki` – Consulta algo na wiki dos sistemas disponíveis'
          ].join('\n')
        }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
