const { Client, Events, GatewayIntentBits,Collection, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const { MessageFlags } = require('discord-api-types/v10');
const { EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

function carregarSistema(sistema) {
  const caminhoArquivo = path.join(__dirname, 'data', `${sistema}.json`);
  try {
    const dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf8'));
    return dados;
  } catch (err) {
    console.error(`Erro ao carregar o arquivo ${sistema}.json:`, err);
    return null;
  }
}

function criarSelectMagias(circuloData) {
  // circuloData.descricao tem as magias separadas por '\n'
  const magias = circuloData.descricao.split('\n').map(m => m.trim()).filter(m => m.length > 0);

  const select = new StringSelectMenuBuilder()
    .setCustomId('select-magia')
    .setPlaceholder('Selecione uma magia');

  magias.forEach(magia => {
    select.addOptions({
      label: magia,
      value: magia.toLowerCase(),  // valor que será enviado na interação
    });
  });

  const row = new ActionRowBuilder().addComponents(select);
  return row;
}

// Adicione esta função normalize no topo do arquivo, antes do client.on('interactionCreate', ...)
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    try {
      const sistema = carregarSistema('Tormenta20');
      if (!sistema) {
        await interaction.reply({ content: 'Erro ao carregar Tormenta20.', ephemeral: true });
        return;
      }

      if (interaction.customId === 'select-circulo') {
        const circuloSelecionado = interaction.values[0];
        console.log('🌀 Círculo selecionado:', circuloSelecionado);
        console.log('🧙 Magias encontradas:', sistema[circuloSelecionado]);

        if (!sistema[circuloSelecionado] || !sistema[circuloSelecionado].descricao) {
          return interaction.update({
            content: `❌ Nenhuma magia cadastrada para o ${circuloSelecionado.replace('_PM', '').replace('círculo_', 'Círculo ')}.`,
            components: [],
            embeds: [],
          });
        }

        const embedMagias = new EmbedBuilder()
          .setTitle(`${circuloSelecionado.replace('_PM', '').replace('círculo_', 'Círculo ')}: escolha a magia`)
          .setColor(0xb02b2e);

        const rowMagias = criarSelectMagias(sistema[circuloSelecionado]);
        await interaction.update({ embeds: [embedMagias], components: [rowMagias] });
        return;
      }

      if (interaction.customId === 'select-magia') {
        const magiaSelecionada = interaction.values[0];

          const chaveMagia = Object.keys(sistema).find(
    key => key.toLowerCase() === magiaSelecionada
  );

  if (!chaveMagia) {
    await interaction.update({ content: 'Magia não encontrada.', components: [], embeds: [] });
    return;
  }

  const detalhesMagia = sistema[chaveMagia]?.descricao || 'Descrição detalhada não disponível.';

  const embedDetalhes = new EmbedBuilder()
    .setTitle(`✨ ${chaveMagia}`)
    .setDescription(detalhesMagia)
    .setColor(0xb02b2e);

  await interaction.update({ embeds: [embedDetalhes], components: [] });
  return;
      }
    } catch (error) {
      console.error('Erro no select menu:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ocorreu um erro ao processar sua seleção.', ephemeral: true });
      }
    }
  }
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});


client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
client.removeAllListeners('messageCreate');
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // Separa input da anotação (qualquer coisa após os dados)
    const [rawInput, ...extraParts] = message.content.trim().split(/\s+/);
    const anotacao = extraParts.join(' ');

    // Suporte a múltiplas rolagens com 2#3d6+1
    const multiMatch = rawInput.match(/^(\d+)#(.+)$/);
    const multi = multiMatch ? parseInt(multiMatch[1]) : 1;
    const baseInput = multiMatch ? multiMatch[2] : rawInput;

    if (!/^\d*d\d+([+\-*/]\d*d?\d+)*$/.test(baseInput)) return;

    const partes = baseInput.match(/[+\-*/]?[^+\-*/]+/g);
    if (!partes) return;

    const resultados = [];

    for (let i = 0; i < multi; i++) {
        let totalFinal = 0;
        let detalhes = [];
        let operacaoAnterior = '+';

        for (let parte of partes) {
            const operador = parte[0].match(/[+\-*/]/) ? parte[0] : operacaoAnterior;
            parte = parte[0].match(/[+\-*/]/) ? parte.slice(1) : parte;
            operacaoAnterior = operador;

            let valor = 0;

            if (/^\d*d\d+$/.test(parte)) {
                const [qtdStr, facesStr] = parte.split('d');
                const qtd = parseInt(qtdStr || '1');
                const faces = parseInt(facesStr);
                if (qtd > 100 || faces > 1000) {
                    return message.reply('❌ Muitos dados ou faces.');
                }

                const rolls = Array.from({ length: qtd }, () => Math.floor(Math.random() * faces) + 1);
                const destaque = rolls.map(v => v === Math.min(...rolls) ? `**${v}**` : `${v}`);
                valor = rolls.reduce((a, b) => a + b, 0);
                detalhes.push(`[${destaque.join(', ')}]`);
            } else if (/^\d+$/.test(parte)) {
                valor = parseInt(parte);
                detalhes.push(`${valor}`);
            } else {
                return message.reply(`❌ Erro ao interpretar: \`${parte}\``);
            }

            switch (operador) {
                case '+': totalFinal += valor; break;
                case '-': totalFinal -= valor; break;
                case '*': totalFinal *= valor; break;
                case '/': totalFinal = valor === 0 ? 0 : totalFinal / valor; break;
            }
        }

        const resposta =  resultados.push(`\` ${Math.round(totalFinal)} \` ⟵ 📊 ${detalhes.join(' ')} 🎲${baseInput}`);
    }

    let respostaFinal = resultados.join('\n');
    if (anotacao) {
        respostaFinal = `\`*${anotacao}*\`\n${respostaFinal}`;
    }

    message.reply(respostaFinal);
});

  

client.login(token);