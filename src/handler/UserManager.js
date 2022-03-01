const users = new Map()
const UserSolo = require('../components/UserSolo.js')

module.exports = class UserManager {

    static users = () => {
        return users
    }

    static put = (userId, username) => {
        users.set(userId, new UserSolo(userId, 0, 0, 0, username, 0, 'playing'))
        return this.get(userId)
    }

    static exist = (userId) => {
        return users.has(userId) || UserSolo.exists(userId)
    }

    static get = (userId) => {
        if (!users.has(userId)) return undefined
        return users.get(userId)
    }

    static saveAccount = (userId) => {
        this.get(userId).save()
        users.remove(userId)
    }

}