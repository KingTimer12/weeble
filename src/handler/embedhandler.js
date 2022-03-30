const { MessageEmbed } = require("discord.js");
const { others } = require('../utils/emotes.json')

module.exports = {
    error5lettersEmbed(callback, callback2) {
        const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription('Adivinhe qual é o nome do **personagem**.')
        .addField('\u200B', callback(), true)
        .setTimestamp()
        .setFooter({ text: 'O nome precisa conter 5 letras.' });
        if (callback2() != undefined) {
            embed.addField('\u200B', callback(), true)
        }
        return embed
    },
    errorNotExistEmbed(callback, callback2) {
        const embed = new MessageEmbed()
        .setColor('#ff9900')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription('Adivinhe qual é o nome do **personagem**.')
        .addField('\u200B', callback(), true)
        .setTimestamp()
        .setFooter({ text: 'Esse nome não existe!' })
        if (callback2() != undefined) {
            embed.addField('\u200B', callback2(), true)
        }
        return embed
    },
    defaultEmbed(callback, callback2) {
        const embed = new MessageEmbed().setColor('#00ffff')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Adivinhe qual é o nome do **personagem**.`)
        .addField('\u200B', callback(), true)
        .setTimestamp()
        .setFooter({ text: 'Para desistir o jogo, digite cancelar' })
        if (callback2() != undefined) {
            embed.addField('\u200B', callback2(), true)
        }
        return embed
    },
    normalLostEmbed(callback, callback2) {
        const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Você errou! ${others['hihihi']}\nAcha que consegue acertar na próxima vez? ${others['hehehe']}`)
        .addField('\u200B', callback(), true)
        .setTimestamp()
        .setFooter({ text: 'Próximo nome sairá às 00:00' })
        if (callback2() != undefined) {
            embed.addField('\u200B', callback2(), true)
        }
        return embed
    },
    normalCorrectEmbed(streak, callback, callback2) {
        const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Parabéns! Você acertou o nome. ${others["yay"]}\nAcertos consecutivos: **${streak}**`)
        .addField('\u200B', callback(), true)
        .setTimestamp()
        .setFooter({ text: 'Próximo nome sairá às 00:00' })
        if (callback2() != undefined) {
            embed.addField('\u200B', callback2(), true)
            .setDescription(`Parabéns! Você acertou os dois nomes. ${others["yay"]}\nAcertos consecutivos: **${streak}**`)
            .setFooter({ text: 'Próximos nomes sairão às 00:00' })
        }
        return embed
    },
    infiniteDefaultEmbed(streak, streakMax, callback) {
        return new MessageEmbed()
        .setColor('#00ffff')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Adivinhe qual é o nome do **personagem**.\nPontuação: **${streak}**\nRecorde atual: **${streakMax}**`)
        .addFields({ name: '\u200B', value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'Para desistir o jogo, digite cancelar' });
    },
    infiniteCorrectEmbed(streak, streakMax, callback) {
        return new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Adivinhe qual é o nome do **personagem**.\nClique \`🔄 NOVO NOME\` para começar outra partida\nPontuação: **${streak}** | Recorde: **${streakMax}**`)
        .addFields({ name: '\u200B', value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'Clique em desistir caso não queira continuar' });
    },
    infiniteLostEmbed(streak, correctWord, callback) {
        return new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Você perdeu seu streak de ${streak}. ${others['hihihi']}\nQue tal tentar de novo? ${others['hehehe']}`)
        .addFields({ name: `O nome correto era ${correctWord}`, value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'Comece um outro jogo usando o comando' });
    }
}