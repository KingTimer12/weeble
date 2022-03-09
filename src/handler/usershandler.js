const users = new Map()
const messages = new Map()

module.exports = {
    usersPlaying() {
        return users
    },
    messagesInfinite() {
        return messages
    }
}