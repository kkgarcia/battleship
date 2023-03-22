const Player = require('./player')

const Game = () => {
    return {
        player1: Player('You', true),
        player2: Player('Computer', false),
        mode: 'Computer'
    }
}

module.exports = Game