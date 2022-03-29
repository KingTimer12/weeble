const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { grid, letter, others } = require('../utils/emotes.json')
const { getWord, checkStatus, generateWord, getStreak, getStreakInfinite, getStreakInfiniteMax, setStreakAndMaxInfinite, updatePlayer } = require('../handler/databasehandler.js')
const { usersPlaying, usersDuoPlaying, checkUserWord } = require('../handler/usershandler.js')
const readline = require('readline');
const fs = require('fs');

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

module.exports = {
    //diário - solo
    async gameSolo(interaction) {
        if (!hasPermission(interaction)) return

        const userId = interaction.user.id
        const streak = await getStreak(userId, 'Solo')

        const gameMessage = {
            'line1': `   ${grid['gray'].repeat(5)}`,
            'line2': `   ${grid['gray'].repeat(5)}`,
            'line3': `   ${grid['gray'].repeat(5)}`,
            'line4': `   ${grid['gray'].repeat(5)}`,
            'line5': `   ${grid['gray'].repeat(5)}`,
            'line6': `   ${grid['gray'].repeat(5)}`,
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

        const correctWord = await getWord('Solo', async () => await generateWord('Solo'))

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
                await interaction.editReply({ embeds: [exampleEmbed] })
                i--;
            } else if (await validWord(word) == false) {
                exampleEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle('[───────| WEEBLE |───────]')
                    .setDescription(`Adivinhe qual é o nome do **personagem**.`)
                    .addFields({ name: `\u200B`, value: returnGameTable(), inline: true })
                    .setTimestamp()
                    .setFooter({ text: 'ERRO | Esse nome não existe!' })
                await interaction.editReply({ embeds: [exampleEmbed] })
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
                        .addFields({ name: `Você está com streak de: ` + (streak + 1), value: returnGameTable(), inline: true })
                        .setTimestamp()
                        .setFooter({ text: 'Próxima palavra sairá às 00:00' })
                    await interaction.editReply({ embeds: [exampleEmbed] })
                    //await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nParabéns, você acertou em ${i + 1} ${(i+1) == 1 ? "tentativa" : "tentativas"}! ${others['yay']}\n\n${returnGameTable()}`)
                    updatePlayer(userId, 'Solo', true, (streak + 1))
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
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        //await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nVocê perdeu ${others['hihihi']}\nO nome correto era \`${correctWord}\` :nerd:\nAcha que consegue acertar a próxima? ${others['hehehe']}\n\n${returnGameTable()}`)
                        updatePlayer(userId, 'Solo', true, streak + 1)
                        usersPlaying().delete(userId)
                    } else {
                        exampleEmbed = new MessageEmbed()
                            .setColor('AQUA')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription('Adivinhe qual é o nome do **personagem**.')
                            .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                            .setTimestamp()
                            .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });
                        await interaction.editReply({ embeds: [exampleEmbed] });
                        //await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do personagem!\n\n${returnGameTable()}`)
                    }
                }
            }
        }
    },

    //diário - duo
    async gameDuo(interaction) {
        if (!hasPermission(interaction)) return

        const userId = interaction.user.id
        const streak = await getStreak(userId, 'Duo')

        const gameMessage = {
            'line1': `${grid['gray'].repeat(5)}`,
            'line2': `${grid['gray'].repeat(5)}`,
            'line3': `${grid['gray'].repeat(5)}`,
            'line4': `${grid['gray'].repeat(5)}`,
            'line5': `${grid['gray'].repeat(5)}`,
            'line6': `${grid['gray'].repeat(5)}`
        }

        function returnGameTable(table) {
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
            return Object.values(gameMessage).map(line => line).join('\n')
        }

        var exampleEmbed = new MessageEmbed()
            .setColor('AQUA')
            .setTitle('[───────| WEEBLE |───────]')
            .setDescription('Adivinhe qual é o nome do **personagem**.')
            .addFields(
                { name: '\u200B', value: returnGameTable(1), inline: true },
                { name: '\u200B', value: returnGameTable(2), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });

        await interaction.reply({
            embeds: [exampleEmbed],
            ephemeral: true,
        })

        const correctWords = await getWord('Duo', async () => await generateWord('Duo'))
        const split = correctWords.split(';')
        const primaryWord = split[0]
        const secondaryWord = split[1]

        console.log(`${primaryWord} primeira palavra!`)
        console.log(`${secondaryWord} segunda palavra!`)

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
                    .addFields(
                        { name: '\u200B', value: returnGameTable(1), inline: true },
                        { name: '\u200B', value: returnGameTable(2), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ERRO | Nome precisa conter 5 letras!' })
                await interaction.editReply({ embeds: [exampleEmbed] })
                i--;
            } else if (await validWord(word) == false) {
                exampleEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle('[───────| WEEBLE |───────]')
                    .setDescription(`Adivinhe qual é o nome do **personagem**.`)
                    .addFields(
                        { name: '\u200B', value: returnGameTable(1), inline: true },
                        { name: '\u200B', value: returnGameTable(2), inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ERRO | Esse nome não existe!' })
                await interaction.editReply({ embeds: [exampleEmbed] })
                //await interaction.editReply(`[~~───────~~ **WEEBLE** ~~───────~~]\nAdivinhe qual é o nome do **personagem**\n\n${returnGameTable()}\n\n**ERRO** Esse nome não existe! **ERRO**`)
                i--;
            } else {

                let map = new Map()
                let table2 = Object.keys({})
                let table1 = Object.keys({})

                //TODO: Checar a palavra correta de cada tabela
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

                if (word == primaryWord) {
                    if (checkUserWord().has(userId)) {
                        exampleEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Parabéns! Você acertou os dois nomes. ${others["yay"]}`)
                            .addFields(
                                { name: `Você está com streak de: ${(streak + 1)}`, value: returnGameTable(1), inline: true },
                                { name: `\u200B`, value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Próxima palavra sairá às 00:00' })
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        updatePlayer(userId, 'Duo', true, (streak + 1))
                        usersPlaying().delete(userId)
                        checkUserWord().delete(userId)
                        i = 7
                        return
                    }
                    exampleEmbed = new MessageEmbed()
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
                } else if (word == secondaryWord) {
                    if (checkUserWord().has(userId)) {
                        exampleEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Parabéns! Você acertou os dois nomes. ${others["yay"]}`)
                            .addFields(
                                { name: `Você está com streak de: ${(streak + 1)}`, value: returnGameTable(1), inline: true },
                                { name: `\u200B`, value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Próxima palavra sairá às 00:00' })
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        updatePlayer(userId, 'Duo', true, (streak + 1))
                        usersPlaying().delete(userId)
                        checkUserWord().delete(userId)
                        i = 7
                        return
                    }
                    exampleEmbed = new MessageEmbed()
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
                } else {
                    if (i == 5) {
                        exampleEmbed = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Você perdeu ${others['hihihi']}\nAcha que consegue acertar na próxima vez? ${others['hehehe']} ${streak == 0 ? `Você perdeu seu streak de ${streak}` : ``}`)
                            .addFields(
                                { name: checkUserWord().has(userId) && checkUserWord().get(userId) == primaryWord ? '\u200B' : `O nome correto: ${primaryWord}`, value: returnGameTable(1), inline: true },
                                { name: checkUserWord().has(userId) && checkUserWord().get(userId) == secondaryWord ? '\u200B' : `O nome correto: ${secondaryWord}`, value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Próxima palavra sairá às 00:00' })
                        await interaction.editReply({ embeds: [exampleEmbed] })
                        updatePlayer(userId, 'Duo', true, streak)
                        usersPlaying().delete(userId)
                    } else {
                        exampleEmbed = new MessageEmbed()
                            .setColor('AQUA')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription('Adivinhe qual é o nome do **personagem**.')
                            .addFields(
                                { name: '\u200B', value: returnGameTable(1), inline: true },
                                { name: '\u200B', value: returnGameTable(2), inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });
                        await interaction.editReply({ embeds: [exampleEmbed] });
                    }
                }
            }
        }
    },

    //infinito
    async gameInfinite(interaction) {
        if (!hasPermission(interaction)) return

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

        var streak = await getStreakInfinite(userId)
        var streakMax = await getStreakInfiniteMax(userId)

        var exampleEmbed = new MessageEmbed()
            .setColor('AQUA')
            .setTitle('[───────| WEEBLE |───────]')
            .setDescription(`Adivinhe qual é o nome do **personagem**.\nPontuação: **${streak}**`)
            .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
            .setTimestamp()
            .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });

        await interaction.reply({
            embeds: [exampleEmbed],
            ephemeral: true,
        })
        const read = readline.createInterface({
            input: fs.createReadStream('src/utils/wordsList.txt'),
            output: process.stdout,
            terminal: false,
        });

        const words = Object.keys({})
        for await (const line of read) {
            words.push(line)
        }

        var correctWord = words[Math.floor(Math.random() * words.length)].toLowerCase()
        console.log(`${correctWord} palavra!`)

        for (let i = 0; i < 6; i++) {
            const collectedMessage = await awaitMessage(interaction)
            setTimeout(async () => await collectedMessage.message.delete(), 100);
            const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

            if (word == 'cancelar') {
                i = 7;
            } else if (word.length != 5) {
                exampleEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle('[───────| WEEBLE |───────]')
                    .setDescription('Adivinhe qual é o nome do **personagem**.')
                    .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                    .setTimestamp()
                    .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });
                await interaction.editReply({ embeds: [exampleEmbed] });
                i--;
            } else if (await validWord(word) == false) {
                exampleEmbed = new MessageEmbed()
                    .setColor('AQUA')
                    .setTitle('[───────| WEEBLE |───────]')
                    .setDescription('Adivinhe qual é o nome do **personagem**.')
                    .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                    .setTimestamp()
                    .setFooter({ text: 'Para cancelar o jogo, digite cancelar' });
                await interaction.editReply({ embeds: [exampleEmbed] });
                i--;
            } else {

                gameMessage[`line${i + 1}`] = await convertTextToEmojis(word, correctWord);

                if (word == correctWord) {
                    exampleEmbed = new MessageEmbed()
                        .setColor('AQUA')
                        .setTitle('[───────| WEEBLE |───────]')
                        .setDescription(`Adivinhe qual é o nome do **personagem**.\nClique \`🔄 NOVO NOME\` para começar outra partida\nPontuação: **${streak}** | Recorde: **${streakMax}**`)
                        .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                        .setTimestamp()
                        .setFooter({ text: 'Clique em desistir para abandonar.' });
                    const buttons = new MessageActionRow().addComponents(
                        new MessageButton().setCustomId('play')
                            .setLabel('🔄 NOVO NOME')
                            .setStyle('PRIMARY'),
                        new MessageButton().setCustomId('cancel')
                            .setLabel('🚩 DESISTIR')
                            .setStyle('DANGER')
                    )
                    await interaction.editReply({ embeds: [exampleEmbed], components: [buttons] })

                    await setStreakAndMaxInfinite(userId, streak + 1, (streak + 1) > streakMax ? (streak + 1) : streakMax)

                    if (await playAgain(interaction) == true) {
                        streak = await getStreakInfinite(userId)
                        streakMax = await getStreakInfiniteMax(userId)
                        i = -1
                        correctWord = words[Math.floor(Math.random() * words.length)].toLowerCase()
                        console.log(`${correctWord} palavra!`)
                        reset()
                        exampleEmbed = new MessageEmbed()
                            .setColor('AQUA')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Adivinhe qual é o nome do **personagem**.\nPontuação: **${streak}**`)
                            .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                            .setTimestamp()
                            .setFooter({ text: 'Para desistir do jogo, digite cancelar' });
                        await interaction.editReply({ embeds: [exampleEmbed], components: [] })
                    } else {
                        i = 7
                        await interaction.editReply({ embeds: [exampleEmbed], components: [] })
                    }
                } else {
                    if (i == 5) {
                        exampleEmbed = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription(`Você perdeu ${others['hihihi']}\nAcha que consegue acertar na próxima vez? ${others['hehehe']}`)
                            .addFields({ name: `O nome correto era ${correctWord}`, value: returnGameTable(), inline: true })
                            .setTimestamp()
                            .setFooter({ text: 'Comece um outro jogo usando o comando' })
                        await setStreakAndMaxInfinite(userId, 0, streakMax)
                        await interaction.editReply({ embeds: [exampleEmbed] });
                    } else {
                        exampleEmbed = new MessageEmbed()
                            .setColor('AQUA')
                            .setTitle('[───────| WEEBLE |───────]')
                            .setDescription('Adivinhe qual é o nome do **personagem**.')
                            .addFields({ name: '\u200B', value: returnGameTable(), inline: true })
                            .setTimestamp()
                            .setFooter({ text: 'Para desistir do jogo, digite cancelar' });
                        await interaction.editReply({ embeds: [exampleEmbed] });
                    }
                }
            }
        }
    }
}