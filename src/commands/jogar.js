const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {grid, letter, others} = require('../utils/emotes.json')
const {getWord, setStatus, checkStatus, generateWord, getStreak, setStreak} = require('../handler/databasehandler.js')
const {words} = require('../utils/validGuess.json')
const {usersPlaying} = require('../handler/usershandler.js')

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

//pegar as mensagens que foram enviadas
async function awaitMessage(interaction) {
	const filter = (msg) => interaction.user.id == msg.author.id
	const sendedMessage = interaction.channel.awaitMessages({ max: 1, filter }).then(async (msg) => {
		const response = { content: '', message: msg.first() }
		const content = await msg.first().content
		if (content) {
			response.content = content.trim().toLowerCase()
		}
		return response
	})
	return sendedMessage
}

//validar a palavra
async function validWord(word) {
	for await (const line of words) {
		if (line == word) {
			return true
		}
	}
	return false
}

//convertar a palavra em emojis
async function convertTextToEmojis(word, correctWord) {
	const contentArray = word.split('')
	const correctWordArray = correctWord.split('')

	const usedLetters = []

	const wordInEmojis = {
		'1': '',
		'2': '',
		'3': '',
		'4': '',
		'5': '',
	}

	for (let i = 0; i < contentArray.length; i++) {
		if (contentArray[i] == correctWordArray[i]) {
			usedLetters.push(contentArray[i])
			wordInEmojis[`${i + 1}`] = letter[correctWordArray[i]]['green']
		}
	}

	for (let i = 0; i < contentArray.length; i++) {
		if (correctWordArray.includes(contentArray[i]) && contentArray[i] != correctWordArray[i]) {
			usedLetters.push(contentArray[i])

			const caracterCountCorrect = correctWordArray.filter(car => car == contentArray[i])
			const caracterCountContent = usedLetters.filter(car => car == contentArray[i])

			if (caracterCountContent.length > caracterCountCorrect.length)
				wordInEmojis[`${i + 1}`] = letter[contentArray[i]]['gray']
			else wordInEmojis[`${i + 1}`] = letter[contentArray[i]]['yellow'] 
			
		} else if (contentArray[i] != correctWordArray[i]) {
			usedLetters.push(contentArray[i])
			wordInEmojis[`${i + 1}`] = letter[contentArray[i]]['gray']
		}
	}

	return Object.values(wordInEmojis).map(emoji => emoji).join('');
}

async function hasPermission(interaction) {
	const channel = interaction.client.channels.cache.get(interaction.channel.id)
	if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
		await interaction.reply('Eita! Aparentemente não tenho permissão para fazer essa ação. Por favor, me dê um cargo que tenha permissão: `Gerenciar mensagens`.')
		return false
	}
	return true
}

//diário
async function gameSolo(interaction) {
	if (!hasPermission(interaction)) return

	const userId = interaction.user.id
	const streak = await getStreak(userId)

	const gameMessage = {
		'line1': `${grid['gray'].repeat(5)}`,
		'line2': `${grid['gray'].repeat(5)}`,
		'line3': `${grid['gray'].repeat(5)}`,
		'line4': `${grid['gray'].repeat(5)}`,
		'line5': `${grid['gray'].repeat(5)}`,
		'line6': `${grid['gray'].repeat(5)}`,
	}

	function returnGameTable() {
		if (usersPlaying().has(userId)) {
			const userTries = usersPlaying().get(userId)
			if (userTries == undefined) {
				return Object.values(gameMessage).map(line => line).join('\n')
			}
			for (let i = 0; i < 6; i++) {
				if (userTries[i] == undefined || userTries[i] == null) {
					gameMessage[`line${i + 1}`] = `${grid['gray'].repeat(5)}`
				} else {
					gameMessage[`line${i + 1}`] = userTries[i]
				}
			}
		}
		return Object.values(gameMessage).map(line => line).join('\n')
	}

	var exampleEmbed = new MessageEmbed()
	.setColor('AQUA')
	.setTitle('[───────| WEEBLE |───────]')
	.setDescription('Adivinhe qual é o nome do **personagem**.')
	.addFields({ name: '\u200B', value: returnGameTable(), inline: true })
	.setTimestamp()
	.setFooter({ text: 'Para cancelar o jogo, digite cancelar' });

	await interaction.reply({
		embeds: [exampleEmbed],
		ephemeral: true,
	})

	const correctWord = await getWord(async () => await generateWord())

	console.log(`${correctWord} palavra!`)

	for (let i = 0; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction)
		setTimeout(async () => await collectedMessage.message.delete(), 200);
		const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

		if (word == 'cancelar') {
			await interaction.editReply(`Você cancelou a partida! Volte qualquer dia para tentar novamente.`)
			i = 7;
		} else if (word.length != 5) {
			exampleEmbed = new MessageEmbed()
					.setColor('AQUA')
					.setTitle('[───────| WEEBLE |───────]')
					.setDescription(`Adivinhe qual é o nome do **personagem**.`)
					.addFields({ name: `\u200B`, value: returnGameTable(), inline: true })
					.setTimestamp()
					.setFooter({ text: 'ERRO | Nome precisa conter 5 letras!' })
			await interaction.editReply({embeds: [exampleEmbed]})
			i--;
		} else if (await validWord(word) == false) {
			exampleEmbed = new MessageEmbed()
					.setColor('AQUA')
					.setTitle('[───────| WEEBLE |───────]')
					.setDescription(`Adivinhe qual é o nome do **personagem**.`)
					.addFields({ name: `\u200B`, value: returnGameTable(), inline: true })
					.setTimestamp()
					.setFooter({ text: 'ERRO | Esse nome não existe!' })
			await interaction.editReply({embeds: [exampleEmbed]})
			//await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem**\n\n${returnGameTable()}\n\n**ERRO** Esse nome não existe! **ERRO**`)
			i--;
		} else {

			if (usersPlaying().has(userId)) {
				let array = usersPlaying().get(userId)
				array.push(await convertTextToEmojis(word, correctWord))
				usersPlaying().set(userId, array)
			} else {
				let array = Object.keys({})
				array.push(await convertTextToEmojis(word, correctWord))
				usersPlaying().set(userId, array)
			}

			if (word == correctWord) {
				exampleEmbed = new MessageEmbed()
					.setColor('GREEN')
					.setTitle('[───────| WEEBLE |───────]')
					.setDescription(`Parabéns! Você acertou o nome. ${others["yay"]}`)
					.addFields({ name: `Você está com streak de: ` + (streak+1), value: returnGameTable(), inline: true })
					.setTimestamp()
					.setFooter({ text: 'Próxima palavra sairá às 00:00' })
				await interaction.editReply({embeds: [exampleEmbed]})
				//await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nParabéns, você acertou em ${i + 1} ${(i+1) == 1 ? "tentativa" : "tentativas"}! ${others['yay']}\n\n${returnGameTable()}`)
				setStatus(userId, true)
				setStreak(userId, (streak+1))
				usersPlaying().delete(userId)
				i = 7
			} else {
				if (i == 5) {
					exampleEmbed = new MessageEmbed()
					.setColor('RED')
					.setTitle('[───────| WEEBLE |───────]')
					.setDescription(`Você perdeu ${others['hihihi']}\nAcha que consegue acertar na próxima vez? ${others['hehehe']} ${streak == 0 ? `Você perdeu seu streak de ${streak}` : ``}`)
					.addFields({ name: `O nome correto era ${correctWord}`, value: returnGameTable(), inline: true })
					.setTimestamp()
					.setFooter({ text: 'Próxima palavra sairá às 00:00' })
					await interaction.editReply({embeds: [exampleEmbed]})
					//await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nVocê perdeu ${others['hihihi']}\nO nome correto era \`${correctWord}\` :nerd:\nAcha que consegue acertar a próxima? ${others['hehehe']}\n\n${returnGameTable()}`)
					setStatus(userId, true)
					usersPlaying().delete(userId)
				} else {
					exampleEmbed = new MessageEmbed()
					.setColor('AQUA')
					.setTitle('[───────| WEEBLE |───────]')
					.setDescription('Adivinhe qual é o nome do **personagem**.')
					.addFields({ name: '\u200B', value: returnGameTable(), inline: true })
					.setTimestamp()
					.setFooter({ text: 'Para cancelar o jogo, digite cancelar' });
					await interaction.editReply({embeds: [exampleEmbed]});
					//await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do personagem!\n\n${returnGameTable()}`)
				}
			}
		}
	}
}


//infinito
async function gameInfinite(interaction) {
	const channel = interaction.client.channels.cache.get(interaction.channel.id);
	if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
		await interaction.reply('Eita! Aparentemente não tenho permissão para fazer essa ação. Por favor, me dê um cargo que tenha permissão: `Gerenciar mensagens`.');
		return;
	}

	const userId = interaction.user.id

	var gameMessage = {
		'line1': `${grid['gray'].repeat(5)}`,
		'line2': `${grid['gray'].repeat(5)}`,
		'line3': `${grid['gray'].repeat(5)}`,
		'line4': `${grid['gray'].repeat(5)}`,
		'line5': `${grid['gray'].repeat(5)}`,
		'line6': `${grid['gray'].repeat(5)}`,
	}

	function reset() {
		gameMessage = {
			'line1': `${grid['gray'].repeat(5)}`,
			'line2': `${grid['gray'].repeat(5)}`,
			'line3': `${grid['gray'].repeat(5)}`,
			'line4': `${grid['gray'].repeat(5)}`,
			'line5': `${grid['gray'].repeat(5)}`,
			'line6': `${grid['gray'].repeat(5)}`,
		}
	}

	function returnGameTable() {
		return Object.values(gameMessage).map(line => line).join('\n')
	}

	await interaction.reply({
		content: `[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem** •\n\n${returnGameTable()}\n\n> Os personagens podem ser de animes e jogos!\n> Para cancelar o jogo, digite \`cancelar\``,
		ephemeral: true,
	});

	var correctWord = words[Math.floor(Math.random() * words.length)]
	console.log(`${correctWord} palavra!`)

	for (let i = 0; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction)
		setTimeout(async () => await collectedMessage.message.delete(), 100);
		const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

		if (word == 'cancelar') {
			i = 7;
		} else if (word.length != 5) {
			await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem**\n\n${returnGameTable()}\n\n**ERRO** O nome precisa conter 5 letras! **ERRO**`);
			i--;
		} else if (await validWord(word) == false) {
			await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem**\n\n${returnGameTable()}\n\n**ERRO** Esse nome não existe! **ERRO**`);
			i--;
		} else {

			gameMessage[`line${i + 1}`] = await convertTextToEmojis(word, correctWord);

			if (word == correctWord) {
				i = -1
				correctWord = words[Math.floor(Math.random() * words.length)]
				console.log(`${correctWord} palavra!`)
				reset()
				await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem** •\n\n${returnGameTable()}\n\n> Os personagens podem ser de animes e jogos!\n> Para cancelar o jogo, digite \`cancelar\``);
			} else {
				if (i == 5) {
					await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nVocê perdeu ${others['hihihi']}\nO nome correto era \`${correctWord}\` :nerd:\nAcha que consegue acertar a próxima? ${others['hehehe']}\n\n${returnGameTable()}`);
				} else {
					await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do personagem!\n\n${returnGameTable()}`);
				}
			}
		}
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jogar')
		.setDescription('Iniciar o jogo')
		.addSubcommand(subcommand =>
			subcommand
			.setName('diário')
			.setDescription('Descubra o nome do dia!'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('infinito')
			.setDescription('Faça o máximo de pontos!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() == 'diário') {
			if (await checkStatus(interaction.user.id) == false) {
				gameSolo(interaction)
				return
			}
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `Você já jogou hoje! Tempo restante até a próxima palavra: <t:${timestamp}:R>`,
				ephemeral: true,
			});
		} else {
			gameInfinite(interaction)
		}
	},
};