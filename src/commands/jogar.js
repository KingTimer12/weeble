const { SlashCommandBuilder } = require('@discordjs/builders');
const {grid, letter, others} = require('../utils/emotes.json')
const {checkWord, getWord, setStatus, checkStatus, generateWord} = require('../handler/databasehandler.js')
const {words} = require('../utils/validGuess.json')

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

//o jogo
async function gameSolo(interaction) {
	const channel = interaction.client.channels.cache.get(interaction.channel.id);
	if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
		await interaction.reply('Eita! Aparentemente não tenho permissão para fazer essa ação. Por favor, me dê um cargo que tenha permissão: `Gerenciar mensagens`.');
		return;
	}

	const userId = interaction.user.id

	const gameMessage = {
		'line1': `${grid['gray'].repeat(5)}`,
		'line2': `${grid['gray'].repeat(5)}`,
		'line3': `${grid['gray'].repeat(5)}`,
		'line4': `${grid['gray'].repeat(5)}`,
		'line5': `${grid['gray'].repeat(5)}`,
		'line6': `${grid['gray'].repeat(5)}`,
	};

	function returnGameTable() {
		return Object.values(gameMessage).map(line => line).join('\n');
	}

	await interaction.reply({
		content: `[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem** •\n\n${returnGameTable()}\n\n> Os personagens podem ser de animes e jogos!\n> Para cancelar o jogo, digite \`cancelar\``,
		ephemeral: true,
	});

	const correctWord = await getWord(async () => await generateWord())

	console.log(`${correctWord} palavra!`)

	for (let i = 0; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction)
		setTimeout(async () => await collectedMessage.message.delete(), 200);
		const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

		if (word == 'cancelar') {
			i = 7;
		} else if (word.length != 5) {
			await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem** •\n\n${returnGameTable()}\n\n**ERRO** O nome precisa conter 5 letras! **ERRO**`);
			i--;
		} else if (await validWord(word) == false) {
			await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem** •\n\n${returnGameTable()}\n\n**ERRO** Esse nome não existe! **ERRO**`);
			i--;
		} else {
			gameMessage[`line${i + 1}`] = await convertTextToEmojis(word, correctWord);
			if (word == correctWord) {
				await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nParabéns, você acertou em ${i + 1} ${(i+1) == 1 ? "tentativa" : "tentativas"}! ${others['yay']}\n\n${returnGameTable()}`);
				setStatus(userId, true)
				i = 7
			} else {
				if (i == 5) {
					await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nVocê perdeu ${others['hihihi']}\nO nome correto era \`${correctWord}\` :nerd:\nAcha que consegue acertar a próxima? ${others['hehehe']}\n\n${returnGameTable()}`);
					setStatus(userId, true)
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
		.setDescription('Iniciar o jogo'),
	async execute(interaction) {
		if (await checkStatus(interaction.user.id) == false) {
			gameSolo(interaction)
		} else {
			console.log('Esse cara já jogou!')
		}
	},
};