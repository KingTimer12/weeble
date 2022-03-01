const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const {token} = require('../config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    client.user.setActivity({ type: 'PLAYING', name: 'contra você!' });
	setInterval(() => {
		const activities = [
			{ type: 'PLAYING', name: `em ${client.guilds.cache.size} servidores` },
			{ type: 'PLAYING', name: 'contra você!' },
			{ type: 'WATCHING', name: 'suas tentativas...' },
		];
		const randomActivity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(randomActivity.name, { type: randomActivity.type });
	}, 900_000);
	console.log('Bot ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied) {
			await interaction.editReply('Ops! Um erro apareceu, por favor, tente novamente mais tarde.');
		} else {
			await interaction.reply('Ops! Um erro apareceu, por favor, tente novamente mais tarde.');
		}
	}
});

client.login(token);