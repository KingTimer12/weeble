const { MessageEmbed } = require("discord.js");
const { others } = require('../utils/emotes.json')

module.exports = {
    error5lettersEmbed(callback) {
        return new MessageEmbed()
        .setColor('#ff9900')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription('Adivinhe qual é o nome do **personagem**.')
        .addFields({ name: '\u200B', value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'O nome precisa conter 5 letras.' });
    },
    errorNotExistEmbed(callback) {
        return new MessageEmbed()
        .setColor('#ff9900')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription('Adivinhe qual é o nome do **personagem**.')
        .addFields({ name: '\u200B', value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'Esse nome não existe!' });
    },
    defaultEmbed(callback) {
        return new MessageEmbed()
        .setColor('#00ffff')
        .setTitle('[───────| WEEBLE |───────]')
        .setDescription(`Adivinhe qual é o nome do **personagem**.`)
        .addFields({ name: '\u200B', value: callback(), inline: true })
        .setTimestamp()
        .setFooter({ text: 'Para desistir o jogo, digite cancelar' });
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