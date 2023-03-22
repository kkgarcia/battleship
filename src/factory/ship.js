const proto = {
    hit() {
        this.hitCount++
    },
    isSunk() {
        return this.length === this.hitCount
    }
}

const Ship = (name, length, hitCount=0) => {
    return Object.assign(Object.create(proto), {name, length, hitCount})
}

module.exports = Ship