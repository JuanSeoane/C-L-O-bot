const { SlashCommandBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('cargo-emoji')
    .setDescription('Mensagem para ganhar cargos ao reagir'),

  async execute(interaction) {
     const roleNecessaria = '💎ᆞ Diretor';
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
    const cargoEmojiMap = {
      '💮': '1372238782710943814',
      '🕵️': '1372430024317075466',
      '📖': '1372238673411838062',
      '⛩': '1372238668864946246',
      '💥': '1372238671683518514', // Removi o espaço extra aqui
    };

    const texto = `
<@&829106369604354048>,

Novas tags disponíveis no Onboarding:

(Novos tipos de Mesa)
<@&1372238782710943814> 💮 : Mesas mais anime, correlacionadas ou diretamente no estilo
<@&1372430024317075466> 🕵️ : Mesas que involvem misterio ou suspense
<@&1372238673411838062> 📖   : Mesas focadas em Rp e narraçao, algum combate mas nao é recorrente

(Novos Sistemas)
<@&1372238668864946246> ⛩ e <@&1372238671683518514> 💥

📌 Basta reagir com o emoji correspondente a esta mensagem para receber a tag!
    `;

    const message = await interaction.reply({ content: texto, fetchReply: true });

    for (const emoji of Object.keys(cargoEmojiMap)) {
      await message.react(emoji);
    }

    const filter = (reaction, user) =>
      !user.bot && Object.keys(cargoEmojiMap).includes(reaction.emoji.name);

    const collector = message.createReactionCollector({ filter, dispose: true });

    collector.on('collect', async (reaction, user) => {
      const guild = reaction.message.guild;
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const roleId = cargoEmojiMap[reaction.emoji.name];
      const role = guild.roles.cache.get(roleId);
      if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role).catch(console.error);
      }
    });

    collector.on('remove', async (reaction, user) => {
      const guild = reaction.message.guild;
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const roleId = cargoEmojiMap[reaction.emoji.name];
      const role = guild.roles.cache.get(roleId);
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(console.error);
      }
    });
  }
};
