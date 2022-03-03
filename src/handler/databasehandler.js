const { db } = require('../../databasefb.js')
const { ref, child, get, set } = require('firebase/database')
const {words} = require('../utils/worldList.json')

module.exports = {
    
    async checkStatus(userId) {
        const dbRef = ref(db());
        let bool = false
        await get(child(dbRef, `Players/${userId}`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                bool = await snapshot.val().stats
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        console.log(bool)
        return bool
    },

    async setStatus(userId, stats) {
        const dbRef = ref(db());
        await set(child(dbRef, `Players/${userId}`), {
            stats: stats
        })
    },

    async checkWord(word) {
        const dbRef = ref(db());
        let bool = false
        await get(child(dbRef, `Words/Solo/${word}`)).then((snapshot) => {
            bool = snapshot.exists()
        })
        new Promise(resolve => setTimeout(resolve, 200));
        return bool
    },

    async getWord(callback) {
        const dbRef = ref(db());
        let word = undefined
        var day = 1
        await get(child(dbRef, `Words/Solo`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                day = array.length
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        await get(child(dbRef, `Words/Solo/${day}`)).then((snapshot) => {
            if (snapshot.exists()) {
                word = snapshot.val()
                console.log(snapshot.val())
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));
        if (word == undefined) {
            return callback()
        }
        return word
    },

    async generateWord() {
        const dbRef = ref(db());
        var word = words[Math.floor(Math.random() * words.length)]

        //pegar o dia
        var day = 1
        await get(child(dbRef, `Words/Solo`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                day = array.length
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));

        //checar se já existe a palavra
        let bool = false
        await get(child(dbRef, `Words/Solo/${day}/${word}`)).then((snapshot) => {
            bool = snapshot.exists()
        })
        new Promise(resolve => setTimeout(resolve, 200));
        while (bool) {
            word = words[Math.floor(Math.random() * words.length)]
        }

        //resetar os jogadores
        await get(child(dbRef, `Players`)).then(async (snapshot) => {
            if (snapshot.exists()) {
                const array = Object.keys(await snapshot.val())
                array.forEach(async userId => {
                    await set(child(dbRef, `Players/${userId}`), {
                        stats: stats
                    })
                })
            }
        })
        new Promise(resolve => setTimeout(resolve, 200));

        //adicionar a nova palavra
        await set(child(dbRef, `Words/Solo/${day}/${word}`), {
            timestamp: Date.now()
        })
        return word
    }

}