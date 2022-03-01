const {words} = require('../utils/worldList.json')
const WordSolo = require('../components/WordSolo.js')

module.exports = class UserManager {

    static newWord = async () => {
        var word = words[Math.floor(Math.random() * words.length)]
        while (await WordSolo.exists(word)) { //Não deixar palavras se repetir
            word = words[Math.floor(Math.random() * words.length)]
        }
        //WordSolo.save(word, Date.now())
        return word
    }

}