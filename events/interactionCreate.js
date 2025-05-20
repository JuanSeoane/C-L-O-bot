const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (interaction.isModalSubmit()) {
      const customId = interaction.customId;

      // Se for a primeira parte do modal (Nome, Idade, Peso, Altura)
      if (customId.startsWith('modal_nome_')) {
        const sistema = customId.split('_')[2];  // Pega o sistema escolhido (gurps4e, dnd5e, etc.)
        const nome = interaction.fields.getTextInputValue('nome');
        const idade = interaction.fields.getTextInputValue('idade');
        const peso = interaction.fields.getTextInputValue('peso');
        const altura = interaction.fields.getTextInputValue('altura');

        // Inicializa a ficha do jogador no client.fichas se não existir
        if (!interaction.client.fichas[interaction.user.id]) {
          interaction.client.fichas[interaction.user.id] = {};
        }

        // Armazena as informações da ficha no objeto fichas
        interaction.client.fichas[interaction.user.id] = {
          sistema,
          nome,
          idade,
          peso,
          altura
        };

        // Perguntas sobre os atributos (ST, DX, IQ, HT)
        const atributosModal = new ModalBuilder()
          .setCustomId('modal_atributos')
          .setTitle('Atributos do Personagem');

        const st = new TextInputBuilder()
          .setCustomId('st')
          .setLabel('Força (ST)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const dx = new TextInputBuilder()
          .setCustomId('dx')
          .setLabel('Destreza (DX)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const iq = new TextInputBuilder()
          .setCustomId('iq')
          .setLabel('Inteligência (IQ)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const ht = new TextInputBuilder()
          .setCustomId('ht')
          .setLabel('Vitalidade (HT)')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        atributosModal.addComponents(
          new ActionRowBuilder().addComponents(st),
          new ActionRowBuilder().addComponents(dx),
          new ActionRowBuilder().addComponents(iq),
          new ActionRowBuilder().addComponents(ht)
        );

        // Envia o modal com os atributos
        return await interaction.showModal(atributosModal);
      }

      // Se for a segunda parte do modal (atributos ST, DX, IQ, HT)
      if (customId === 'modal_atributos') {
        const ficha = interaction.client.fichas[interaction.user.id];
        if (!ficha) {
          return interaction.reply({ content: 'Erro ao recuperar ficha.', ephemeral: true });
        }

        // Armazena os atributos
        ficha.st = interaction.fields.getTextInputValue('st');
        ficha.dx = interaction.fields.getTextInputValue('dx');
        ficha.iq = interaction.fields.getTextInputValue('iq');
        ficha.ht = interaction.fields.getTextInputValue('ht');

        // Calcular PV, PF, GdP, GdB (simples exemplo)
        const PV = ficha.st;
        const PF = ficha.ht;
        const GdP = `1d6+${Math.floor((parseInt(ficha.st) - 10) / 2)}`;
        const GdB = `+${Math.floor((parseInt(ficha.st) - 10) / 2)}`;

        // Resposta final com a ficha formatada
        return interaction.reply({
          content: `**Ficha Final:**

\`\`\`
Nome: ${ficha.nome}
[Idade: ${ficha.idade} | Peso: ${ficha.peso}kg | Altura: ${ficha.altura}cm]

ST: ${ficha.st} | DX: ${ficha.dx} | IQ: ${ficha.iq} | HT: ${ficha.ht}
Pts de Vida: ${PV} | Pts de Fadiga: ${PF}
GdP: ${GdP} | GdB: ${GdB}
\`\`\`
`,
          ephemeral: false // A ficha será visível publicamente
        });
      }
    }
  }
};
