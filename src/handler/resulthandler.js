const { grid, letter } = require('../utils/emotes.json')

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

module.exports = {
    //Função para o Solo
    async convertToDefaultEmojis(content) {
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
    },
    //Função para o Duo
    async convertToNumberEmojis(userId, primaryWord, secondaryWord) {
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
    
        return `${await getEmoji(number1)} ${await getEmoji(number2)}`
    }
}