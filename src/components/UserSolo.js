const { db } = require('../../databasefb')
const { ref, child, get, set } = require('firebase/database')

module.exports = class UserSolo {

    constructor(userId, level, streakDaily, streakDailyMax, username, xp, daily) {
        this.userId = userId
        this.username = username
        this.level = level
        this.xp = xp
        this.streakDaily = streakDaily
        this.daily = daily
        this.streakDailyMax = streakDailyMax
    }

    hasDaily = () => {
        return this.daily == 'played'
    }

    setDaily = () => {
        this.daily = 'played'
    }

    addXp = (xp) => {
        this.xp = this.xp + xp
    }

    addStreak = () => {
        this.streakDaily++
        if (this.streakDaily > this.streakDailyMax) {
            this.streakDailyMax++
        }
    }

    resetStreak = () => {
        this.streakDaily = 0
    }

    static exists = async () => {
        const dbRef = ref(db())
        let bool = false
        await get(child(dbRef, `Jogadores/${this.userId}`)).then((snapshot) => {
            bool = snapshot.exists()
        })
        new Promise(resolve => setTimeout(resolve, 300))
        return bool
    }

    save = async () => {
        const dbRef = ref(db())
        await set(child(dbRef, `Jogadores/${this.userId}`), {
            level: this.level,
            username: this.username,
            xp: this.xp,
            daily: this.daily,
            streakDaily: this.streakDaily,
            streakDailyMax: this.streakDailyMax
        })
    }
    
    load = async () => {
        const dbRef = ref(db())
        await get(child(dbRef, `Jogadores/${this.userId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                this.level = snapshot.val().level
                this.username = snapshot.val().username
                this.xp = snapshot.val().xp
                this.daily = snapshot.val().daily
                this.streakDaily = snapshot.val().streakDaily
                this.streakDailyMax = snapshot.val().streakDailyMax
            }
        })
    }
    
}