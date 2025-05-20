const { Events, EmbedBuilder } = require('discord.js');

// Coloque aqui os IDs dos canais de forma flexível
const canalBoasVindasID = '1134946842166177943';
const canaisGuia = {
  regras: '829092204068732979',
  apresentacoes: '1364670453972602930',
  geral: '829364665087688714',
  mesasdacasa: '1173056678367858689'
};

module.exports = {
  name: Events.GuildMemberAdd,
  execute(member) {
    const channel = member.guild.channels.cache.get(canalBoasVindasID);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`🏨 Bem-vindo ao Hotel dos Parças ${member.user.username}!`)
      .setDescription(`👋 Seja bem-vindo(a), ${member}! Esperamos que aproveite sua estadia.`)
      .addFields(
        { name: '📌 Guia do Servidor', value: `
🔹 Regras: <#${canaisGuia.regras}>
🔹 Apresente-se: <#${canaisGuia.apresentacoes}>
🔹 Mesas da Casa: <#${canaisGuia.mesasdacasa}>
🔹 Chat Geral: <#${canaisGuia.geral}>
        ` }
      )
      .setFooter({ text: 'Fique à vontade e divirta-se!' })
      .setTimestamp();

    channel.send({ content: `${member} entra pela porta principal...`, embeds: [embed] });
  },
};

