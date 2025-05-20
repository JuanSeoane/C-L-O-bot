const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,
  execute(member) {
    const canalId = '1134946842166177943'; // mesmo canal de boas-vindas
    const canal = member.guild.channels.cache.get(canalId);
    if (!canal || !canal.isTextBased()) return;

    const mensagemSaida = `👋 O hóspede **${member.user.username}** fez o check-out do Hotel, e está proibido de retornar ao servidor!`;

    canal.send(mensagemSaida).catch(console.error);
  },
};
