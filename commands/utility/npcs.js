const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const verificarPermissao = require('./verificacao'); 
module.exports = {
  data: new SlashCommandBuilder()
    .setName('npc')
    .setDescription('Gera um 🌐 NPC aleatório com nome, idade, gênero e uma característica marcante'),

  async execute(interaction) {
    const roleNecessaria = '👤ᆞHospede'; // Altere aqui a role permitida
        if (!verificarPermissao(interaction, roleNecessaria)) {
          return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        const resposta = await fetch('https://randomuser.me/api/');
        const dados = await resposta.json();
        const usuario = dados.results[0];
    
        const nome = `${usuario.name.first} ${usuario.name.last}`;
        const genero = usuario.gender === 'male' ? 'Masculino' : 'Feminino';
        const idade = usuario.dob.age;
        const foto = usuario.picture.large;
    
        const caracteristicas = [
          'Tem uma cicatriz que corta a sobrancelha no lado esquerdo.',
          'Fala com um sotaque estranho e encantador.',
          'Está sempre mascando algo.',
          'Tem um olho de cor incomum.',
          'Anda com uma bengala, mesmo sem precisar.',
          'Possui uma tatuagem mágica que brilha às vezes.',
          'Roupas sempre sujas de tinta ou graxa.',
          'Risos constantes mesmo em momentos sérios.'
        ];
        const caracteristica = caracteristicas[Math.floor(Math.random() * caracteristicas.length)];
    
        const corAleatoria = Math.floor(Math.random() * 16777215); 
    
        const embed = new EmbedBuilder()
          .setTitle('🌌 NPC Gerado 🌌')
          .setColor(corAleatoria)
          .setThumbnail(foto)
          .addFields(
            { name: 'Nome', value: nome, inline: true },
            { name: 'Gênero', value: genero, inline: true },
            { name: 'Idade', value: `${idade} anos`, inline: true },
            { name: 'Característica Marcante', value: caracteristica }
          );
    
        await interaction.reply({ embeds: [embed] });
      }
    };