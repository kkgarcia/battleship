const Ship  = require('../factory/ship')
const Player = require('../factory/player')


const Destroyer = Ship('Destroyer', 3)
const Patrol = Ship('Patrol', 2)

const me = Player('Me')
const opponent = Player('Enemy')

const getRandomCoord = () => {
    const x = Math.floor(Math.random() * 10)
    const y = Math.floor(Math.random() * 10)
    return [x, y]
}

me.board.placeShip([1, 0], Destroyer, 'horiz')
opponent.board.placeShip([2, 1], Patrol, 'horiz')
me.shoot(opponent, [2, 2])
opponent.shoot(me, [1, 2])
me.shoot(opponent, [2, 1])

console.log(me.board.board)
console.log(opponent.board.board)


console.log(Destroyer)