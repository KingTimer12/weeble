const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { grid, letter, others } = require('../utils/emotes.json')
const { getWord, generateWord, getStreak, getStreakInfinite, getStreakInfiniteMax, setStreakAndMaxInfinite, updatePlayer, getDayOfToday } = require('../handler/databasehandler.js')
const { usersPlaying, usersDuoPlaying, checkUserWord } = require('../handler/usershandler.js')
const readline = require('readline');
const fs = require('fs');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { errorNotExistEmbed, error5lettersEmbed, infiniteDefaultEmbed, defaultEmbed, infiniteLostEmbed, infiniteCorrectEmbed, normalLostEmbed, normalCorrectEmbed } = require('./embedhandler');
const { ActionRow } = require('@discordjs/builders');
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
    const words = readline.createInterface({
        input: fs.createReadStream('src/utils/wordsList.txt'),
        output: process.stdout,
        terminal: false,
    });

    for await (const line of words) {
        if (line.toLowerCase() == word.toLowerCase()) {
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

//check permission
async function hasPermission(interaction) {
    const channel = interaction.client.channels.cache.get(interaction.channel.id)
    if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
        await interaction.reply('Eita! Aparentemente não tenho permissão para fazer essa ação. Por favor, me dê um cargo que tenha permissão: `Gerenciar mensagens`.')
        return false
    }
    return true
}

//Game infinite - play again
async function playAgain(interaction) {
    const filter = (button) => button.user.id == interaction.user.id;

    let result = '';
    await interaction.channel.awaitMessageComponent({ filter }).then(index => result = index.customId)

    if (result == 'play') return true
    else return false
}

//Game infinite - random word
async function randomWord() {
    const read = readline.createInterface({
        input: fs.createReadStream('src/utils/wordsList.txt'),
        output: process.stdout,
        terminal: false,
    });

    const words = Object.keys({})
    for await (const line of read) {
        words.push(line)
    }

    return words[Math.floor(Math.random() * words.length)].toLowerCase()
}

//Função para o Duo
async function convertToNumberEmojis(userId, primaryWord, secondaryWord) {
    let number1 = 0;
    let number2 = 0;

    const table1 = Object.keys({})
    const table2 = Object.keys({})

    if (usersDuoPlaying().has(userId)) {
        const map = usersDuoPlaying().get(userId)
        if (map.has(1)) {
            const userTries = map.get(1)
            for (let i = 0; i < 6; i++) {
                if (userTries[i] == undefined || userTries[i] == null) {
                    table1.push(`${grid['gray'].repeat(5)}`)
                } else {
                    table1.push(`${userTries[i]}`)
                }
            }
        }
        if (map.has(2)) {
            const userTries = map.get(2)
            for (let i = 0; i < 6; i++) {
                if (userTries[i] == undefined || userTries[i] == null) {
                    table2.push(`${grid['gray'].repeat(5)}`)
                } else {
                    table2.push(`${userTries[i]}`)
                }
            }
        }
    }

    const correctWordArray = primaryWord.split('')
    const correctWord2Array = secondaryWord.split('')
    const wordInEmojis = Object.keys({})
    const word2InEmojis = Object.keys({})
    for (let i = 0; i < 5; i++) {
        wordInEmojis.push(letter[correctWordArray[i]]['green'])
        word2InEmojis.push(letter[correctWord2Array[i]]['green'])
    }

    let primary = ``
    for (const lettersInString of wordInEmojis) {
        primary += lettersInString
    }

    let secondary = ``
    for (const lettersInString of word2InEmojis) {
        secondary += lettersInString
    }

    for (let i = 0; i < 6; i++) {
        if (table1.find((v, index) => index == i) == primary) {
            number1 = i+1
        }
        if (table2.find((v, index) => index == i) == secondary) {
            number2 = i+1
        }
        if (number1 != 0 && number2 != 0) {
            break
        }
    }

    console.log(number1)
    console.log(number2)

	return `${await getEmoji(number1)} ${await getEmoji(number2)}`
}

async function getEmoji(number) {
    if (number == 0) {
        return `0️⃣`
    }
    if (number == 1) {
        return '1️⃣'
    }
    if (number == 2) {
        return '2️⃣'
    }
    if (number == 3) {
        return '3️⃣'
    }
    if (number == 4) {
        return '4️⃣'
    }
    if (number == 5) {
        return '5️⃣'
    }
    if (number == 6) {
        return '6️⃣'
    }
}

//Função para o Solo
async function convertToDefaultEmojis(content) {
	content = await content.replaceAll('\n', '');
	content = await content.replace(/>/g, '> ');

	const contentArray = await content.split(' ');
	contentArray.splice(-1);

	const shareMessage = {
		'line1': '',
		'line2': '',
		'line3': '',
		'line4': '',
		'line5': '',
		'line6': '',
	};

    const array = Object.keys({})
    array.push('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z')

	let convertedLetters = '';
    for (const emoji of contentArray) {
        for (const letters of array) {
            if (letter[letters]['yellow'] == emoji) {
                convertedLetters += '🟨 ';
                console.log(letter[letters]['yellow'])
            }
            else if (letter[letters]['green'] == emoji) {
                convertedLetters += '🟩 ';
                console.log(letter[letters]['green'])
            }
            else if (letter[letters]['gray'] == emoji) {
                convertedLetters += '⬛ ';
                console.log(letter[letters]['gray'])
            }
        }
        if (grid['gray'] == emoji) {
            convertedLetters += '⬛ ';
        }
    }
    console.log(convertedLetters)

	const shareMessageArray = convertedLetters.split(' ');
	shareMessageArray.splice(-1);

	const lineLength = shareMessageArray.length / 5;
	for (let i = 0; i < lineLength; i++) {
		shareMessage[`line${i + 1}`] = shareMessageArray.splice(0, 5).join('');
	}

	return Object.values(shareMessage).map(line => line).join('\n');
}

async function iosOrAndroidPc(interaction) {
	const filter = (button) => button.user.id === interaction.user.id;

	let plataform = '';
	await interaction.channel.awaitMessageComponent({ filter })
		.then(int => {
			if (int.customId === 'pc-ios') plataform = 'pc-ios';
			else plataform = 'android';
		});

	return plataform;
}

module.exports = {

    async game(interaction, mode) {
        if (!hasPermission(interaction)) return

        let gameMessage = {
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

        const userId = interaction.user.id
        var streak = mode == "Infinite" ? await getStreakInfinite(userId) : await getStreak(userId, mode)
        var streakMax = await getStreakInfiniteMax(userId)

        function returnGameTable(table) {
            if (mode != "Infinite") {
                if (mode == "Solo") {
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
                } else if (mode == "Duo") {
                    if (usersDuoPlaying().has(userId)) {
                        const map = usersDuoPlaying().get(userId)
                        if (map.has(table)) {
                            const userTries = map.get(table)
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
                    }
                }
            }
            return Object.values(gameMessage).map(line => line).join('\n')
        }

        await interaction.reply(
            {
                embeds: [mode == "Infinite" ? 
                infiniteDefaultEmbed(streak, streakMax, () => returnGameTable(1)) :
                defaultEmbed(
                    () => returnGameTable(1),
                    () => mode == "Solo" ? undefined : returnGameTable(2)
                )],
                ephemeral: true,
            })

        let correctWord = await randomWord()
        let primaryWord = undefined
        let secondaryWord = undefined
        if (mode == "Solo") {
            correctWord = await getWord('Solo', async () => await generateWord('Solo'))
        } else if (mode == "Duo") {
            correctWord = await getWord('Duo', async () => await generateWord('Duo'))
            const split = correctWord.split(';')
            primaryWord = split[0]
            secondaryWord = split[1]
        }

        console.log(`${correctWord} palavra!`)

        for (let i = 0; i < 6; i++) {
            const collectedMessage = await awaitMessage(interaction)
            setTimeout(async () => await collectedMessage.message.delete(), 50);
            const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

            if (word == 'cancelar') {
                await interaction.editReply({ content: 'Você cancelou a partida! Volte qualquer dia para jogar novamente.', embeds: [], components: [] })
                i = 7;
            } else if (word.length != 5) {
                await interaction.editReply({
                    embeds: [
                        error5lettersEmbed(
                            () => returnGameTable(1),
                            () => mode == "Duo" ? returnGameTable(2) : undefined)
                    ]
                })
                i--;
            } else if (await validWord(word) == false) {
                await interaction.editReply({
                    embeds: [
                        errorNotExistEmbed(
                            () => returnGameTable(1),
                            () => mode == "Duo" ? returnGameTable(2) : undefined)
                    ]
                })
                i--;
            } else {
                if (mode == "Solo") {
                    let array = Object.keys({})
                    if (usersPlaying().has(userId)) {
                        array = usersPlaying().get(userId)
                    }
                    array.push(await convertTextToEmojis(word, correctWord))
                    usersPlaying().set(userId, array)
                } else if (mode == "Duo") {
                    let map = new Map()
                    let table2 = Object.keys({})
                    let table1 = Object.keys({})
                    
                    if (usersDuoPlaying().has(userId)) {
                        map = usersDuoPlaying().get(userId)
                        if (map.has(1)) {
                            table1 = map.get(1)
                        }
                        if (map.has(2)) {
                            table2 = map.get(2)
                        }
                    }
                    if (!(checkUserWord().has(userId) && checkUserWord().get(userId) == primaryWord)) {
                        table1.push(await convertTextToEmojis(word, primaryWord))
                    }
                    if (!(checkUserWord().has(userId) && checkUserWord().get(userId) == secondaryWord)) {
                        table2.push(await convertTextToEmojis(word, secondaryWord))
                    }
                    map.set(1, table1)
                    map.set(2, table2)
                    usersDuoPlaying().set(userId, map)
                } else {
                    gameMessage[`line${i + 1}`] = await convertTextToEmojis(word, correctWord)
                }

                const buttons = new ActionRow()
                if (mode != "Duo") {
                    if (word == correctWord) {
                        if (mode == "Solo") {
                            buttons.addComponents(
                                new MessageButton().setCustomId('pc-ios')
                                .setLabel('PC ou iOS')
                                .setStyle('PRIMARY'),
                                new MessageButton().setCustomId('android')
                                .setLabel('Android')
                                .setStyle('PRIMARY'))
                            await interaction.editReply({ embeds: [
                                normalCorrectEmbed((streak+1),
                                () => returnGameTable(1),
                                () => undefined)
                            ], components: [buttons]})
                            await updatePlayer(userId, 'Solo', true, (streak + 1))

                            if (await iosOrAndroidPc(interaction) === 'pc-ios') {
                                await interaction.editReply({
                                    content: `Acertei o Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToDefaultEmojis(returnGameTable())}`,
                                    embeds: [],
                                    components: [],
                                });
                            } else {
                                await interaction.editReply({
                                    content: `\`\`\`\nAcertei o Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToDefaultEmojis(returnGameTable())}\`\`\``,
                                    embeds: [],
                                    components: [],
                                });
                            }

                            usersPlaying().delete(userId)
                            i = 7
                        } else {
                            buttons.addComponents(
                                new MessageButton().setCustomId('play')
                                    .setLabel('🔄 NOVO NOME')
                                    .setStyle('PRIMARY'),
                                new MessageButton().setCustomId('cancel')
                                    .setLabel('🚩 DESISTIR')
                                    .setStyle('DANGER')
                            )
                            await interaction.editReply({ embeds: [infiniteCorrectEmbed(streak, streakMax, () => returnGameTable())], components: [buttons] })
                            await setStreakAndMaxInfinite(userId, streak + 1, (streak + 1) > streakMax ? (streak + 1) : streakMax)
                            if (await playAgain(interaction) == true) {
                                streak = await getStreakInfinite(userId)
                                streakMax = await getStreakInfiniteMax(userId)
                                i = -1
                                correctWord = await randomWord()
                                console.log(`${correctWord} palavra!`)
                                reset()
                                await interaction.editReply({ embeds: [infiniteDefaultEmbed(streak, streakMax, () => returnGameTable())], components: [] })
                            } else {
                                i = 7
                                await interaction.editReply({ content: 'Você desistiu da partida! Volte qualquer dia para jogar novamente.', embeds: [], components: [] })
                            }
                        }
                        continue
                    }
                } else {
                    if (word == primaryWord) {
                        if (checkUserWord().has(userId)) {
                            buttons.addComponents(
                                new MessageButton().setCustomId('pc-ios')
                                .setLabel('PC ou iOS')
                                .setStyle('PRIMARY'),
                                new MessageButton().setCustomId('android')
                                .setLabel('Android')
                                .setStyle('PRIMARY'))
                            await interaction.editReply({ embeds: [normalCorrectEmbed((streak+1),
                                () => returnGameTable(1),
                                () => returnGameTable(2))
                            ], components: [buttons]})
                            await updatePlayer(userId, 'Duo', true, (streak + 1))

                            if (await iosOrAndroidPc(interaction) === 'pc-ios') {
                                await interaction.editReply({
                                    content: `Acertei o dueto do Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToDefaultEmojis(returnGameTable())}`,
                                    embeds: [],
                                    components: [],
                                });
                            } else {
                                await interaction.editReply({
                                    content: `\`\`\`\nAcertei o Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToDefaultEmojis(returnGameTable())}\`\`\``,
                                    embeds: [],
                                    components: [],
                                });
                            }

                            usersDuoPlaying().delete(userId)
                            checkUserWord().delete(userId)
                            i = 7
                            return
                        }
                        const exampleEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Primeira palavra encontrada!`)
                            .addFields(
                                { name: `\u200B`, value: returnGameTable(1), inline: true },
                                { name: `\u200B`, value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Agora falta só a segunda' })
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        checkUserWord().set(userId, primaryWord)
                        continue
                    } else if (word == secondaryWord) {
                        if (checkUserWord().has(userId)) {

                            buttons.addComponents(
                                new MessageButton().setCustomId('pc-ios')
                                .setLabel('PC ou iOS')
                                .setStyle('PRIMARY'),
                                new MessageButton().setCustomId('android')
                                .setLabel('Android')
                                .setStyle('PRIMARY'))

                            await interaction.editReply({ embeds: [normalCorrectEmbed((streak+1),
                                () => returnGameTable(1),
                                () => returnGameTable(2))
                            ], components: [buttons]})
                            await updatePlayer(userId, 'Duo', true, (streak + 1))

                            if (await iosOrAndroidPc(interaction) === 'pc-ios') {
                                await interaction.editReply({
                                    content: `Acertei o dueto do Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToNumberEmojis(userId, primaryWord,secondaryWord)}`,
                                    embeds: [],
                                    components: [],
                                });
                            } else {
                                await interaction.editReply({
                                    content: `\`\`\`\nAcertei o Weeble de hoje!\nDia ${await getDayOfToday(mode)} - ${streak+1} ${(streak+1) == 1 ? 'vitória consecutiva' : 'vitórias consecutivas 🔥'}
                                    \n${await convertToNumberEmojis(userId, primaryWord,secondaryWord)}\`\`\``,
                                    embeds: [],
                                    components: [],
                                });
                            }

                            usersDuoPlaying().delete(userId)
                            checkUserWord().delete(userId)
                            i = 7
                            return
                        }
                        const exampleEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Segunda palavra encontrada!`)
                            .addFields(
                                { name: `\u200B`, value: returnGameTable(1), inline: true },
                                { name: `\u200B`, value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Agora falta só a primeira' })
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        checkUserWord().set(userId, secondaryWord)
                        continue
                    }
                }

                if (i == 5) {
                    await interaction.editReply({ embeds: [normalLostEmbed(
                        () => returnGameTable(1),
                        () => mode == "Duo" ? returnGameTable(2) : undefined)
                    ]})
                    if (mode == "Infinite") {
                        await setStreakAndMaxInfinite(userId, 0, streakMax)
                    } else {
                        await updatePlayer(userId, mode, true, 0)
                        usersPlaying().delete(userId)
                        usersDuoPlaying().delete(userId)
                        checkUserWord().delete(userId)
                    }
                } else {
                    await interaction.editReply({
                        embeds: [mode == "Infite" ? 
                        infiniteDefaultEmbed(streak, streakMax, () => returnGameTable(1)) :
                        defaultEmbed(
                            () => returnGameTable(1),
                            () => mode == "Duo" ? returnGameTable(2) : undefined
                        )],
                        ephemeral: true,
                    });
                }
            }
        }
    }
}