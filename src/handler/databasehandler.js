const { db } = require('../../databasefb.js')
const { ref, child, get, set } = require('firebase/database')
const fs = require('fs');
const readline = require('readline');

module.exports = {
    
    async checkStatus(userId, mode) {
        const dbRef = ref(db());
        let bool = false
        await get(child(dbRef, `Players/${mode}/${userId}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                bool = await snapshot.val().stats
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return bool
    },

    async getStreak(userId, mode) {
        const dbRef = ref(db());
        let streak = 0
        await get(child(dbRef, `Players/${mode}/${userId}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                streak = await snapshot.val().streak
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return streak
    },

    async getStreakInfinite(userId) {
        const dbRef = ref(db());
        let streak = 0
        await get(child(dbRef, `Players/Infinite/${userId}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                streak = await snapshot.val().streak
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return (streak == undefined ? 0 : streak)
    },

    async getStreakInfiniteMax(userId) {
        const dbRef = ref(db());
        let streak = 0
        await get(child(dbRef, `Players/Infinite/${userId}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                streak = await snapshot.val().streakmax
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return (streak == undefined ? 0 : streak)
    },

    async updatePlayer(userId, mode, stats, streak) {
        const dbRef = ref(db());
        await set(child(dbRef, `Players/${mode}/${userId}`), {
            stats: stats,
            streak: streak
        })
    },

    async setStreakAndMaxInfinite(userId, streak, streakMax) {
        const dbRef = ref(db());
        await set(child(dbRef, `Players/Infinite/${userId}`), {
            streak: streak,
            streakmax: streakMax
        })
    },

    async checkWord(word) {
        const dbRef = ref(db());
        let bool = false
        await get(child(dbRef, `Words/${mode}/${word}`)).then((snapshot) => {
            bool = snapshot.exists()
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return bool
    },

    async getWord(mode, callback) {
        const dbRef = ref(db());
        let word = undefined
        var day = 1
        await get(child(dbRef, `Words/${mode}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                day = array.length
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        await get(child(dbRef, `Words/${mode}/${day}`)).then((snapshot) => {
            if (snapshot.exists()) {
                word = snapshot.val().word
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        if (word == undefined) {
            return callback()
        }
        return word
    },

    async generateWord(mode) {
        const dbRef = ref(db());

        const read = readline.createInterface({
            input: fs.createReadStream('src/utils/wordsList.txt'),
            output: process.stdout,
            terminal: false,
        });
        const words = Object.keys({})
        for await (const line of read) {
            words.push(line)
        }

        var word1 = words[Math.floor(Math.random() * words.length)].toLowerCase()
        var word2 = undefined
        let word = undefined

        if (mode == 'Duo') {
            word2 = words[Math.floor(Math.random() * words.length)].toLowerCase()
            while (word1 == word2) {
                word2 = words[Math.floor(Math.random() * words.length)].toLowerCase()
            }
            word = `${word1};${word2}`
        } else word = word1

        //pegar o dia
        var day = 1
        await get(child(dbRef, `Words/${mode}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                day = array.length
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));

        //checar se já existe a palavra
        let bool = false
        let bool2 = false
        await get(child(dbRef, `Words/${mode}/${day}`)).then((snapshot) => {
            if (snapshot.exists()) {
                if (mode == 'Duo') {
                    var array = snapshot.val().word.split(';')
                    bool = word1 == array[0]
                    bool2 = word2 == array[1]
                } else bool = word == snapshot.val().word
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        if (mode == 'Duo') {
            if (bool) {
                word = `${words[Math.floor(Math.random() * words.length)].toLowerCase()};${word2}`
            }
            if (bool2) {
                word = `${word1};${words[Math.floor(Math.random() * words.length)].toLowerCase()}`
            }
        } else if (bool) {
            word = words[Math.floor(Math.random() * words.length)].toLowerCase()
        }

        //resetar os jogadores
        await get(child(dbRef, `Players/${mode}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                array.forEach(async userId => {
                    await set(child(dbRef, `Players/${userId}`), {
                        stats: false
                    })
                })
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));

        //adicionar a nova palavra
        await set(child(dbRef, `Words/${mode}/${day}`), {
            timestamp: Date.now(),
            word: word
        })
        return word
    }

}