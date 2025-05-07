const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const bannedFile = path.join(__dirname, '..', 'data', 'bannedUsers.json');
    
    let bannedUsers = [];
    if (fs.existsSync(bannedFile)) {
      bannedUsers = JSON.parse(fs.readFileSync(bannedFile, 'utf8'));
    }

    if (!bannedUsers.find(user => user.id === member.id)) {
      bannedUsers.push({
        id: member.id,
        tag: member.user.tag,
        timestamp: Date.now()
      });

      fs.writeFileSync(bannedFile, JSON.stringify(bannedUsers, null, 2));
      console.log(`[BAN-WATCH] ${member.user.tag} saiu e foi registrado.`);
    }
  }
};
