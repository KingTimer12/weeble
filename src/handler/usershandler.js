const usersSolo = new Map()
const usersDuo = new Map()

module.exports = {
    usersPlaying() {
        return usersSolo
    },
    usersDuoPlaying() {
        return usersDuo
    }
}