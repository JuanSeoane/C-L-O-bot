module.exports = (interaction, nomeDaRole = 'everyone') => {
    return interaction.member.roles.cache.some(role => role.name === nomeDaRole);
  };