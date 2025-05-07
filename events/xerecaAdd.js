const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const bannedFile = path.join(__dirname, '..', 'data', 'bannedUsers.json');
    
    if (!fs.existsSync(bannedFile)) return;

    const bannedUsers = JSON.parse(fs.readFileSync(bannedFile, 'utf8'));
    const user = bannedUsers.find(u => u.id === member.id);

    if (user) {
      try {
        await member.ban({ reason: 'Usuário saiu e tentou voltar.' });
        console.log(`[BANIDO] ${member.user.tag} foi banido ao tentar retornar.`);
      } catch (err) {
        console.error(`Erro ao banir ${member.user.tag}:`, err);
      }
    }
  }
};
