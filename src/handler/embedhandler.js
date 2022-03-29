const { MessageEmbed } = require("discord.js");

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
    }
}