const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
const timersAtivos = new Map(); // chave: canalId, valor: intervalo ID

function formatarTempo(segundosTotais) {
  const horas = Math.floor(segundosTotais / 3600);
  const minutos = Math.floor((segundosTotais % 3600) / 60);
  const segundos = segundosTotais % 60;
  return `${horas.toString().padStart(2, '0')}:${minutos
    .toString()
    .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Inicia um timer regressivo 🕐 (um por canal)')
    .addIntegerOption(option =>
      option.setName('horas')
        .setDescription('Horas')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('minutos')
        .setDescription('Minutos')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('segundos')
        .setDescription('Segundos')
        .setRequired(false)
    ),

  async execute(interaction) {
    const roleNecessaria = '👤ᆞHospede'; 
    
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    
       
        
    const canalId = interaction.channel.id;

  
    if (timersAtivos.has(canalId)) {
      return interaction.reply({
        content: '⏳ Já existe um timer ativo neste canal. Aguarde ele terminar.',
        ephemeral: true
      });
    }

    const horas = interaction.options.getInteger('horas') || 0;
    const minutos = interaction.options.getInteger('minutos') || 0;
    const segundos = interaction.options.getInteger('segundos') || 0;

    let totalSegundos = horas * 3600 + minutos * 60 + segundos;

    if (totalSegundos <= 0) {
      return interaction.reply('⏱️ Por favor, insira um tempo válido.');
    }

    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('⏳ Timer Iniciado!')
      .setDescription(`Tempo restante: **${formatarTempo(totalSegundos)}**`)
      .setColor('Orange');

    const message = await interaction.editReply({ embeds: [embed] });

    const intervalo = setInterval(async () => {
      totalSegundos--;

      if (totalSegundos <= 0) {
        clearInterval(intervalo);
        timersAtivos.delete(canalId);

        const finalEmbed = new EmbedBuilder()
          .setTitle('✅ Timer finalizado!')
          .setDescription(`⏰ O tempo acabou! <@${interaction.user.id}> Timer finalizado.`)
          .setColor('Green');

        return await message.edit({ embeds: [finalEmbed] });
      }

      const embedAtualizado = EmbedBuilder.from(embed)
        .setDescription(`Tempo restante: **${formatarTempo(totalSegundos)}**`);

      await message.edit({ embeds: [embedAtualizado] });
    }, 1000);


    timersAtivos.set(canalId, intervalo);
  }
};
