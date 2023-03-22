import Player from "../factory/player";
import Gameboard from "../factory/gameboard";
import Ship from "../factory/ship";
import Game from "../factory/game";

const firstBoard = document.querySelector('.first-board')
const secondBoard = document.querySelector('.second-board')
const radomizeBtn = document.querySelector('#randomize')
const panel = document.querySelector('.panel')
const config = document.querySelector('#hide')
const allShips = document.querySelectorAll('.ship')
const firstShipYard = document.querySelector('.first-shipyard')
const secondShipYard = document.querySelector('.second-shipyard')
const boards = document.querySelector('.boards')

// for reference
const shipsDict = {
    'C': 'Carrier',
    'B': 'Battleship',
    'D': 'Destroyer',
    'S': 'Submarine',
    'P': 'Patrol',
    size: {
        'C':  5,
        'B':  4,
        'D':  3,
        'S':  3,
        'P':  2
    },
    list: ['C', 'B', 'D', 'S', 'P']
}

const myGame = Game()
const { player1: me, player2: opponent, mode } = myGame
opponent.board.placeShipsRandom()

radomizeBtn.addEventListener('click', randomizeAndClearPanel)

function randomizeAndClearPanel() {
    me.board = Gameboard()
    me.board.placeShipsRandom()
    config.style.display = 'none'
    render()
}

function render(boardNumber=2) {

    clearBoards()

    const myBoard = me.board.board
    const opponentBoard = opponent.board.board
    const myShips = me.board.sunkenShips ? [...me.board.ships, ...me.board.sunkenShips] : [...me.board.ships]
    const opponentsShips = opponent.board.sunkenShips ? [...opponent.board.ships, ...opponent.board.sunkenShips] : [...opponent.board.ships]

    for (let i = 0; i < myBoard.length; i++) {
        for (let j = 0; j < myBoard[i].length; j++) {
            const cell = document.createElement('div')
            if (myBoard[i][j] === 'Miss') {
                cell.style.backgroundColor = 'white'
            } else if (myBoard[i][j] === 'Hit') {
                cell.style.backgroundColor = '#e63946'
            } else if (myBoard[i][j] === 'Sunk') {
                cell.style.backgroundColor = '#6c757d'
            } 
            else if (shipsDict.list.includes(myBoard[i][j])) {
               cell.style.backgroundColor = '#293241'
            }

            cell.dataset.coord = `${i}${j}`
            cell.dataset.player = me.name
            cell.addEventListener('click', shoot)
            cell.addEventListener('dragenter', (e) => {
                cell.style.setProperty('filter', 'brightness(1.4)')
            })
            cell.addEventListener('dragleave', (e) => {
                cell.style.setProperty('filter', 'brightness(1)')
            })
            firstBoard.append(cell)
        }
    }

    for (let i = 0; i < myShips.length; i++) {
        const span = document.createElement('span')
        const ship = myShips[i]
        const name = myShips[i].name
        const size = myShips[i].length
        span.textContent = `${name} (${size})`
        if (ship.isSunk()) {
            span.classList.add('sunk')
        }

        firstShipYard.append(span)
    }

    //render only first board
    if (boardNumber === 1) return

    for (let i = 0; i < opponentBoard.length; i++) {
        for (let j = 0; j < opponentBoard[i].length; j++) {
            const cell = document.createElement('div')
            //change to switch later
            if (opponentBoard[i][j] === 'Miss') {
                cell.style.backgroundColor = 'white'
            } else if (opponentBoard[i][j] === 'Hit') {
                cell.style.backgroundColor = '#e63946'
            } else if (opponentBoard[i][j] === 'Sunk') {
                cell.style.backgroundColor = '#6c757d'
            } 
            // else if (shipsDict.list.includes(opponentBoard[i][j])) {
            //    cell.style.backgroundColor = '#293241'
            // }

            cell.dataset.coord = `${i}${j}`
            cell.dataset.player = opponent.name
            cell.addEventListener('click', shoot)
            secondBoard.append(cell)
        }
    }

    for (let i = 0; i < opponentsShips.length; i++) {
        const span = document.createElement('span')
        const ship = opponentsShips[i]
        const name = opponentsShips[i].name
        const size = opponentsShips[i].length
        span.textContent = `${name} (${size})`
        if (ship.isSunk()) {
            span.classList.add('sunk')
        }

        secondShipYard.append(span)
    }
}

render(1)


function shoot() {

    let [x, y] = [...this.dataset.coord]
    const coord = [+x, +y]

    const currentPlayer = [me, opponent].find(player => player.turn)
    const target = [me, opponent].find(player => !player.turn)

    if (currentPlayer.isLost() || target.isLost()) return
    
    if (this.dataset.player === currentPlayer.name) return


    if (shipsDict.list.includes(target.board.board[+x][+y])
            || !target.board.board[+x][+y]) {
            target.board.receiveAttack(coord)
            
            //check win or lose
            if (target.isLost()) {
                
                const display = document.createElement('div')
                display.classList.add('winner-display')

                const text = document.createElement('h2')
                text.textContent = `${currentPlayer.name} won!`

                const restartBtn = document.createElement('button')
                restartBtn.textContent = 'Restart'
                restartBtn.classList.add('restart-btn')
                restartBtn.addEventListener('click', restartGame)
                display.append(text, restartBtn)
                panel.append(display)
            }
    } else return
    // if wasn't hit or sunk change turn
    if (mode === 'Computer' && opponent.board.board[+x][+y] !== 'Hit' && opponent.board.board[+x][+y] !== 'Sunk') {
       
        currentPlayer.board.receiveRandomAttack()
           
        if (currentPlayer.isLost()) {
            
            const display = document.createElement('div')
            display.classList.add('winner-display')

            const text = document.createElement('h2')
            text.textContent = `${target.name} won!`

            const restartBtn = document.createElement('button')
            restartBtn.textContent = 'Restart'
            restartBtn.addEventListener('click', restartGame)
            display.append(text, restartBtn)
            panel.append(display)
        }
    } else {
        if (target.board.board[+x][+y] !== 'Hit'
            && target.board.board[+x][+y] !== 'Sunk') {
            currentPlayer.turn = false
            target.turn = true
        }
    }

    render()
}

function clearBoards() {
    firstBoard.innerHTML = ''
    secondBoard.innerHTML = ''
    firstShipYard.innerHTML = ''
    secondShipYard.innerHTML = ''
}

function restartGame() {
    const display = document.querySelector('.winner-display')
    allShips.forEach(ship => ship.style.visibility = 'visible')
    config.style.display = 'block'
    display.remove()


    me.board.clearBoard()
    opponent.board.clearBoard()
    opponent.board.placeShipsRandom()
    render(1)
}

//Drag and Drop

const shipsDiv = document.querySelectorAll('.ship')

shipsDiv.forEach(ship => {
    ship.addEventListener('dragstart', dragstart_handler)
})

firstBoard.addEventListener('drop', drop_handler)
firstBoard.addEventListener('dragover', dragover_handler)

function dragstart_handler(ev) {
    ev.dataTransfer.setData('text/plain', ev.target.id)
}

function dragover_handler(ev) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'move'
}

function drop_handler(ev) {
    ev.preventDefault()
    //prevent drop if ship exists
    const data = ev.dataTransfer.getData('text')

    
    if (!shipsDict.list.includes(data)) {
        console.log('yooo')
        return
    }
    
    const exists = me.board.ships.find(ship => ship.name === shipsDict[data])
    if (exists) return
    
    // console.log(ev.target.dataset.coord.split(''))
    const raw = ev.target.dataset.coord.split('')
    const coord = [+raw[0], +raw[1]]
    const ship = Ship(shipsDict[data], shipsDict.size[data])

    // check orientation
    const orientation = document.querySelector('input[value="horiz"]')
    const orient = orientation.checked ? 'horiz' : 'vert'
    
    if (me.board.isValidPlacement(ship, coord, orient)) {
        me.board.placeShip(coord, ship, orient)
        document.getElementById(data).style.visibility = 'hidden'
        //later renderFirstBoard()
        render(1)
        if (me.board.ships.length === 5) {
            // console.log('full')
            config.style.display = 'none'
            render()
        }
    }
    
    ev.target.style.setProperty('filter', 'brightness(1)')
}