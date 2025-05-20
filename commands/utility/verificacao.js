module.exports = (interaction, nomeDaRole = '👤ᆞHospede') => {
    return interaction.member.roles.cache.some(role => role.name === nomeDaRole);
  };