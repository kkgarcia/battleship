const Gameboard = require('./gameboard')

const proto = {
    shoot(player, coord) {
        player.board.receiveAttack(coord)
    },

    isLost() {
        return !this.board.ships.length
    }
}

const Player = (name, turn) => {
    const board = Gameboard()

    return Object.assign(Object.create(proto), {name, board, turn})
}

module.exports = Player