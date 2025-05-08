const { Client, Events, GatewayIntentBits,Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const { MessageFlags } = require('discord-api-types/v10');

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
  
    const input = message.content.replace(/\s+/g, ''); 
  
    if (!/^\d*d\d+([+\-*/]\d*d?\d+)*$/.test(input)) return; 
  
    const partes = input.match(/[+\-*/]?[^+\-*/]+/g);
    if (!partes) return;
  
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
            valor = rolls.reduce((a, b) => a + b, 0);
            detalhes.push(`${operador} [${rolls.join(', ')}]`);
        } else if (/^\d+$/.test(parte)) {
            valor = parseInt(parte);
            detalhes.push(`${operador} ${valor}`);
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

    const resposta = `🎲 Rolagem: \`${message.content}\`\n🧮 Dados: ${detalhes.join(' ')}\n📊 Total: **${Math.round(totalFinal)}**`;
    message.reply(resposta);
});
  
  
  

client.login(token);