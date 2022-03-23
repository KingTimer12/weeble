const usersSolo = new Map()
const usersDuo = new Map()
const checkWordUser = new Map()

module.exports = {
    usersPlaying() {
        return usersSolo
    },
    usersDuoPlaying() {
        return usersDuo
    },
    checkUserWord() {
        return checkWordUser
    }
}