const { db } = require('../../databasefb')
const { ref, child, get, set } = require('firebase/database')

module.exports = class WordSolo {

    static exists = async (word) => {
        const dbRef = ref(db())
        let bool = false
        await get(child(dbRef, `Daily/solo/${word}`)).then((snapshot) => {
            bool = snapshot.exists()
        })
        new Promise(resolve => setTimeout(resolve, 300))
        return bool
    }

    static save = async (word, timestamp) => {
        const dbRef = ref(db())
        await set(child(dbRef, `Daily/solo/${word}`), {
            timestamp: timestamp
        })
    }

    static day = async () => {
        const dbRef = ref(db())
        var array = undefined
        await get(child(dbRef, `Daily/solo`)).then((snapshot) => {
            array = Object.keys(snapshot.val())
        })
        new Promise(resolve => setTimeout(resolve, 300))
        return array.length
    }

}