const print = console.log

const createPoint = (x,y) => {
    return {x,y}
}

const manhatam = (a,b) => {
    return Math.abs(b.x-a.x) + Math.abs(b.y-a.y)
} 

const euclidean = (a,b) => {
    return Math.sqrt(((b.x-a.x)^2) + ((b.y-a.y)^2))
}

const normalize = (v) => Number(v*10)

const validateNeighbours = (origin, neighboursList,{up,down,left,right}, positions) => {
  if (up) 
    neighboursList.push(positions.up)
  if (down)
    neighboursList.push(positions.down)
  
  if (left) {
    neighboursList.push(positions.left)
    if(up) {
      const point = createPoint(origin.x -1, origin.y + 1)
      if (!!walkable(point, maze))
        neighboursList.push(point)
    }
    else if (down) {
      const point = createPoint(origin.x -1, origin.y - 1)
      if (!!walkable(point, maze))
        neighboursList.push(point)
    }
  }
    
  if (right) {
    neighboursList.push(positions.left)
    if(up) {
      const point = createPoint(origin.x +1, origin.y + 1)
      if (!!walkable(point, maze))
        neighboursList.push(point)
    }
    else if (down) {
      const point = createPoint(origin.x +1, origin.y - 1)
      if (!!walkable(point, maze))
        neighboursList.push(point)
    }
  }
}

const neighbours = (origin, maze) => {
  const neighboursList = []
  
  const positions = {
    'right': createPoint(origin.x -1, origin.y),
    'left': createPoint(origin.x +1, origin.y),
    'up': createPoint(origin.x, origin.y - 1),
    'down': createPoint(origin.x, origin.y + 1)
  }

  const up = !!walkable(positions.up, maze)
  const left = !!walkable(positions.left, maze)
  const right = !!walkable(positions.right, maze)
  const down  = !!walkable(positions.down, maze)

  validateNeighbours(origin, neighboursList, {up,down, left, right}, positions)

  return neighboursList;
}

const nodeWithCost = (parent, pos, cost) => ({parent, pos, cost})

const findInList =  ({pos}, list) => list.findIndex(({pos: el}) => el.x === pos.x && el.y === pos.y)

const isInside = (pos,list) => {
  return findInList({pos}, list) > -1
}

const removeFromList = (node, list) => {
  const index = findInList(node,list)
  if (index > -1) {
    list.splice(index, 1); 
  }
}

const walkable = (pos, matrix) => matrix[pos.x] && matrix[pos.x][pos.y] === 0

const computeNeighbour = (neighbour, current, goal) => {
 
  if (current.pos.x === neighbour.x || current.pos.y === neighbour.y) {
    return nodeWithCost(current, neighbour, normalize(manhatam(neighbour, goal)) +
      normalize(manhatam(neighbour, current.pos))
    )
  }
  else {
    return nodeWithCost(current, neighbour, normalize(manhatam(neighbour, goal)) + normalize(euclidean(current.pos,neighbour))
    )
  }
}

const aStar = (maze, startRow, startCol, destRow, destCol) => {

    const origin = createPoint(startRow, startCol)
    const goal = createPoint(destRow, destCol)

    if (!walkable(goal,maze))
      return false
    if (!walkable(origin,maze))
      return false
    
    const originNode = nodeWithCost(null,origin , normalize(manhatam(origin, goal)))
    
    const openList = [originNode]
    const closedList = []
    
    let currentNode = originNode;
    
    while (!isInside(goal, closedList)) {
      neighbours(currentNode.pos, maze).filter((neighbour) => {
          if (walkable(neighbour,maze) && !isInside(neighbour,closedList))
            return neighbour      
      }).forEach(neighbour => {
        const computedNeighbour = computeNeighbour(neighbour, currentNode, goal)

        if (!isInside(neighbour, openList)) {
          openList.push(computedNeighbour)
        }
        else {
          const index = findInList(computedNeighbour, openList)
          
          openList[index] = openList[index].cost > computedNeighbour.cost ? 
            computedNeighbour : openList[index]
        } 
      })
      const nextNode = openList.reduce((current, neighbour) => 
        current.cost > neighbour.cost ? neighbour : current
      ,{cost: Number.POSITIVE_INFINITY})

      closedList.push(currentNode)
      removeFromList(currentNode, openList)
      maze[currentNode.pos.x][currentNode.pos.y] = '*'

      currentNode = nextNode

      if (currentNode.cost === Infinity) {
        if (openList.length < 1) {
          return false
        }
      } 
    }
  
    return true
};

const rowIsValid = (row) => {
    for (let i =0; i < row.length; i++) {
        if (row[i] === 0)
            return true
    }
    return false
} 


const solution = (pot) => {
    
    const firstRow = pot[0]
    const lastRow = pot[pot.length -1]
    
    if (rowIsValid(firstRow) && rowIsValid(lastRow)){
        for (let i =0; i < firstRow.length; i++) {
            for (let j = 0; j < lastRow.length; j++) {
                if (aStar(pot, 0, i, pot.length -1, j))
                    return true
            }
        }
    }
  
    return false
};

const pot = [
  [1, 0, 0, 0, 0],
  [1, 1, 0, 1, 0], 
  [1, 0, 0, 1, 0],
  [1, 0, 1, 1, 0],
  [1, 1, 1, 0, 1]
]

print(solution(pot))
