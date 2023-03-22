const Ship = require('./ship')

// Prototype for Gameboard factory 
const proto = {

    placeShip(coord, ship, orientation) {

        this.ships.push(ship)
        let [row, col] = coord
        const id = ship.name.charAt(0)
        const location = []
        if (orientation === 'horiz') {
            for (let i = 0; i < ship.length; i++) {
                this.board[row][col] = id
                location.push([row, col])
                col++
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                this.board[row][col] = id
                location.push([row, col])
                row++
            }
        }
        //set location of a ship
        ship.location = location
    },
    
    receiveAttack(coord) {
        const [row, col] = coord
        const shipsDict = {
            'C': 'Carrier',
            'B': 'Battleship',
            'D': 'Destroyer',
            'S': 'Submarine',
            'P': 'Patrol'
        }

        if (Object.keys(shipsDict).includes(this.board[row][col])) {
            const ship = this.ships.find( ship => ship.name === shipsDict[this.board[row][col]])
            this.board[row][col] = 'Hit'

            ship.hit()
            if (ship.isSunk()) this.sink(ship)
        } else {
            this.board[row][col] = 'Miss'
        }
    },

    sink(ship) {
        const indx = this.ships.findIndex( s => s.name === ship.name )

        for (let i = 0; i < ship.length; i++) {
            const [row, col] = ship.location[i]
            this.board[row][col] = 'Sunk'
        }
        //set adjacent cells to 'shot'
        for (let i = 0; i < ship.location.length; i++) {
            const [row, col] = ship.location[i]

            const adjacentCells = getAdjacentCells([row, col])
            for (let j = 0; j < adjacentCells.length; j++) {
                const [x, y] = adjacentCells[j]
                if (!this.board[x][y]) {
                    this.board[x][y] = 'Miss'
                }
            }
        }
    
        this.sunkenShips.push(ship)
        this.ships.splice(indx, 1)
    },

    clearBoard() {
        this.board = []
        this.ships = []
        this.sunkenShips = []
        for (let i = 0; i < 10; i++) {
            this.board.push([])
            for (let j = 0; j < 10; j++) {
                this.board[i].push(0)
            }
        }
    },

    placeShipsRandom() {
        const ships = [
            Ship('Carrier', 5),
            Ship('Battleship', 4),
            Ship('Destroyer', 3),
            Ship('Submarine', 3),
            Ship('Patrol', 2)
        ]
        const orientations = ['horiz', 'vert'] // add vertic later
        
        while (ships.length) {
            const randomCoord = getRandomCoord()
            const randomOrient = orientations[Math.floor(Math.random() * 2)] // replace 1 with 2 later
            const ship = ships[0]
            if (this.isValidPlacement(ship, randomCoord, randomOrient)) {
                const newShip = ships.shift()
                this.placeShip(randomCoord, newShip, randomOrient)
            }
        }
    },

    isValidPlacement(ship, coord, orientation) {
        let [row, col] = coord
        const location = []
        if (orientation === 'horiz') {
            for (let i = 0; i < ship.length; i++) {
                location.push([row, col])
                col++
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                location.push([row, col])
                row++
            }
        }
        for (let i = 0; i < location.length; i++) {
            const [x, y] = location[i]
            //if out of bound
            if (x < 0 || x > 9 || y < 0 || y > 9) return false
            
            //if theres ship
            if (this.board[x][y]) return false

            //if ship is nearby
            const adjacent = getAdjacentCells(location[i])
            for (let j = 0; j < adjacent.length; j++) {
                const [x, y] = adjacent[j]
                if (this.board[x][y]) return false
            }

        }
        return true
    },

    receiveRandomAttack() {

        const ships = ['C','B','D','S','P']

        // AI
        if (this.lastHit) {
            if (this.lastHit.orient) {
                if (this.lastHit.orient === 'horiz') {
                    // console.log('receiving attack horiz')
                    
                    // console.log('first: ' + this.lastHit.coord)
                    // console.log('last: ' + this.lastHit.lastCoord)
                    const neighbors = getHorizontalNeighbors(this.lastHit.coord, this.lastHit.lastCoord, this.board)
                    // console.log('neighbors:  ' + neighbors)
                    const [x, y] = neighbors[0]
                    console.log('hitting:  ' + neighbors[0])
                    this.receiveAttack(neighbors[0])
                    if (this.board[x][y] === 'Hit') {
                        this.lastHit.coord = this.lastHit.coord[1] > this.lastHit.lastCoord[1] ? this.lastHit.coord : this.lastHit.lastCoord
                        this.lastHit.lastCoord = [x, y]
                        this.receiveRandomAttack()
                        return
                    }
                    if (this.board[x][y] === 'Sunk') {
                        console.log('sunkkkk')
                        this.lastHit = null
                        this.receiveRandomAttack()
                        return
                    }
                    return
                   
                } else {
                    // console.log('receiving attack vert')
                    
                    // console.log('first: ' + this.lastHit.coord)
                    // console.log('last: ' + this.lastHit.lastCoord)
                    const neighbors = getVerticalNeighbors(this.lastHit.coord, this.lastHit.lastCoord, this.board)
                    console.log('neighbors:  ' + neighbors)
                    const [x, y] = neighbors[0]
                    // console.log('hitting:  ' + neighbors[0])
                    this.receiveAttack(neighbors[0])
                    if (this.board[x][y] === 'Hit') {
                        this.lastHit.coord = this.lastHit.coord[0] > this.lastHit.lastCoord[0] ? this.lastHit.coord : this.lastHit.lastCoord
                        this.lastHit.lastCoord = [x, y]
                        this.receiveRandomAttack()
                        return
                    }
                    if (this.board[x][y] === 'Sunk') {
                        console.log('sunkkkk')
                        this.lastHit = null
                        this.receiveRandomAttack()
                        return
                    }
                    return 
                }
            }
            
            // set orientation
            const nextCells = getNextCells(this.lastHit.coord, this.board)
            const randomNumber = Math.floor(Math.random() * nextCells.length)
            const coord = nextCells[randomNumber]
            const [x, y] = coord
            this.receiveAttack(coord)
            if (this.board[x][y] === 'Hit') {
                if(this.lastHit.coord[0] === x) {
                    this.lastHit.orient = 'horiz'
                } else {
                    this.lastHit.orient = 'vert'
                }
                this.lastHit.lastCoord = coord
                this.receiveRandomAttack()
                return
            } else if (this.board[x][y] === 'Sunk') {
                this.lastHit = null
                this.receiveRandomAttack()
                return
            } else return
        }

        const nonHitCells = []

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (ships.includes(this.board[i][j]) || !this.board[i][j]) {
                    nonHitCells.push([i, j])
                }
            }
        }
        const randomNumber = Math.floor(Math.random() * nonHitCells.length)
        const randomCoord = nonHitCells[randomNumber]
        const [x, y] = randomCoord
        this.receiveAttack(randomCoord)
        // console.log('attack:  ' + randomCoord)

        //AI
        if (this.board[x][y] === 'Hit') {
            
            this.lastHit = {coord: randomCoord}
            this.receiveRandomAttack()
            return

        } else if (this.board[x][y] === 'Sunk') {
            this.receiveRandomAttack()
            return
        } else return
    }
}

//helper functions
const getAdjacentCells = (coord) => {
    const [row, col] = coord
    const adjacentCells = [[row-1, col-1], [row-1, col], [row-1, col+1],
                           [row,   col-1],               [row,   col+1],
                           [row+1, col-1], [row+1, col], [row+1, col+1]]
    const filtered = adjacentCells.filter(cell => cell[0] >= 0 && cell[1] >= 0 && cell[0] < 10 && cell[1] < 10)
    return filtered
}

const getNextCells = (coord, board) => {
    const ships = ['C','B','D','S','P']
    const [row, col] = coord
    const nextCells = [                 [row-1, col],
                        [row,   col-1],               [row,   col+1],
                                        [row+1, col]]
    const filtered = nextCells.filter(cell => cell[0] >= 0 && cell[1] >= 0 && cell[0] < 10 && cell[1] < 10)
    const filtered2 = filtered.filter(cell => ships.includes(board[cell[0]][cell[1]]) || !board[cell[0]][cell[1]])
    return filtered2
}

const getHorizontalNeighbors = (coord, lastCoord, board) => {
    const ships = ['C','B','D','S','P']
    const order = []
    const [x, y] = coord
    const [lastX, lastY] = lastCoord
    if (lastY > y) {
        order.push([x, y], [lastX, lastY])
    } else {
        order.push([lastX, lastY], [x, y])
    }
    console.log('Order:  ' + order)
    const [left, right] = order
    const neighbors = [[left[0], left[1]-1], [right[0], right[1]+1]]
    const filtered = neighbors.filter(cell => cell[0] >= 0 && cell[1] >= 0 && cell[0] < 10 && cell[1] < 10)
    const filtered2 = filtered.filter(cell => ships.includes(board[cell[0]][cell[1]]) || !board[cell[0]][cell[1]])
    return filtered2
}

const getVerticalNeighbors = (coord, lastCoord, board) => {
    const ships = ['C','B','D','S','P']
    const order = []
    const [x, y] = coord
    const [lastX, lastY] = lastCoord
    if (lastX > x) {
        order.push([x, y], [lastX, lastY])
    } else {
        order.push([lastX, lastY], [x, y])
    }
    console.log('Order:  ' + order)
    const [top, bottom] = order
    const neighbors = [[top[0]-1, top[1]], [bottom[0]+1, bottom[1]]]
    const filtered = neighbors.filter(cell => cell[0] >= 0 && cell[1] >= 0 && cell[0] < 10 && cell[1] < 10)
    const filtered2 = filtered.filter(cell => ships.includes(board[cell[0]][cell[1]]) || !board[cell[0]][cell[1]])
    return filtered2
}

const getRandomCoord = () => {
    const x = Math.floor(Math.random() * 10)
    const y = Math.floor(Math.random() * 10)
    return [x, y]
}


const Gameboard = () => {
    const board = []
    const ships = []
    const sunkenShips = []
    for (let i = 0; i < 10; i++) {
        board.push([])
        for (let j = 0; j < 10; j++) {
            board[i].push(0)
        }
    }

    return Object.assign(Object.create(proto), { board, ships, sunkenShips })
}

module.exports = Gameboard