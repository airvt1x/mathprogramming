
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 30; 
let playerX = 1, playerY = 1; 
let messageEl = document.getElementById('message');
let isFrozen = false; 
let freezeTimer; 

// Типы ячеек лабиринта
const WALL = 'W';
const EMPTY = '.';
const SLOWDOWN = 'S'; // Замедление
const DANGER = 'D'; // Опасная зона
const TELEPORT = 'T'; // Телепортация
const FREEZE = 'F'; // Заморозка


const maze = [
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'], 
    ['W', '.', '.', '.', 'D', '.', '.', '.', '.', 'W'], 
    ['W', 'T', 'W', '.', 'W', 'W', 'W', 'W', '.', 'W'], 
    ['W', 'F', 'W', '.', '.', '.', '.', 'D', '.', 'W'], 
    ['W', '.', 'W', '.', 'W', 'W', 'W', 'W', 'W', 'W'], 
    ['W', '.', '.', '.', 'S', '.', '.', '.', '.', 'W'], 
    ['W', '.', 'W', '.', 'W', 'W', 'W', 'W', 'W', 'W'], 
    ['W', '.', '.', '.', '.', '.', '.', '.', '.', 'W'], 
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', '.', 'D'],
];


const width = maze[0].length;
const height = maze.length;


canvas.width = width * cellSize;
canvas.height = height * cellSize;


function drawCell(x, y, type) {
    switch(type) {
        case WALL:
            ctx.fillStyle = '#000';
            break;
        case EMPTY:
            ctx.fillStyle = '#fff';
            break;
        case SLOWDOWN:
            ctx.fillStyle = '#ffa500';
            break;
        case DANGER:
            ctx.fillStyle = '#f00';
            break;
        case TELEPORT:
            ctx.fillStyle = '#00f';
            break;
        case FREEZE:
            ctx.fillStyle = '#87ceeb';
            break;
    }
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}


function drawMaze() {
    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            drawCell(j, i, maze[i][j]);
        }
    }
}


function drawPlayer() {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(playerX * cellSize + 2, playerY * cellSize + 2, cellSize - 4, cellSize - 4);
}

function isValidMove(nextX, nextY) {
    if (nextX >= 0 && nextX < width &&
        nextY >= 0 && nextY < height &&
        maze[nextY][nextX] !== WALL) {
        return true;
    }
    return false;
}


function handleObstacle(x, y) {
    const obstacleType = maze[y][x];
    switch(obstacleType) {
        case SLOWDOWN:
            messageEl.textContent = 'Вы попали в зону замедления!';
            setTimeout(() => movePlayer(), 2000); // Задержка перед следующим ходом
            break;
        case DANGER:
            messageEl.textContent = 'Опасная зона! Возвращаемся к началу.';
            playerX = 1;
            playerY = 1;
            break;
        case TELEPORT:
            messageEl.textContent = 'Телепорт! Вы переместились в другую часть лабиринта.';
            let teleportX = Math.floor(Math.random() * width);
            let teleportY = Math.floor(Math.random() * height);
            while (maze[teleportY][teleportX] === WALL || (teleportX === x && teleportY === y)) {
                teleportX = Math.floor(Math.random() * width);
                teleportY = Math.floor(Math.random() * height);
            }
            playerX = teleportX;
            playerY = teleportY;
            break;
        case FREEZE:
            messageEl.textContent = 'Заморожены! Ожидание...';
            isFrozen = true;
            freezeTimer = setTimeout(() => {
                isFrozen = false;
                messageEl.textContent = 'Вы разморожены! Можете двигаться.';
            }, 3000); 
            break;
    }
}


function updatePlayerPosition(newX, newY) {
    playerX = newX;
    playerY = newY;
}


function movePlayer(direction) {
    if (!isFrozen) { 
        let nextX = playerX;
        let nextY = playerY;
        
        switch(direction) {
            case 'left':
                nextX--;
                break;
            case 'right':
                nextX++;
                break;
            case 'up':
                nextY--;
                break;
            case 'down':
                nextY++;
                break;
        }

        if (isValidMove(nextX, nextY)) {
            updatePlayerPosition(nextX, nextY);
            handleObstacle(nextX, nextY);
        }

        drawMaze();
        drawPlayer();
    }
}


document.addEventListener('keydown', function(event) {
    const keyCode = event.keyCode;
    switch(keyCode) {
        case 37: 
            movePlayer('left');
            break;
        case 38: 
            movePlayer('up');
            break;
        case 39: 
            movePlayer('right');
            break;
        case 40: 
            movePlayer('down');
            break;
    }
});


function findPath() {
    const queue = [];
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const parent = Array.from({ length: height }, () => Array(width).fill(null));
    
    queue.push({ x: playerX, y: playerY });
    visited[playerY][playerX] = true;

    const directions = [
        { dx: 0, dy: -1 }, 
        { dx: 0, dy: 1 },  
        { dx: -1, dy: 0 }, 
        { dx: 1, dy: 0 }   
    ];

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        
        if (x === width - 2 && y === height - 2) {
            drawPath(parent);
            return;
        }

        for (const { dx, dy } of directions) {
            const nextX = x + dx;
            const nextY = y + dy;

            if (isValidMove(nextX, nextY) && !visited[nextY][nextX]) {
                visited[nextY][nextX] = true;
                parent[nextY][nextX] = { x, y };
                queue.push({ x: nextX, y: nextY });
            }
        }
    }

    messageEl.textContent = 'Путь не найден!';
}


function drawPath(parent) {
    let currentX = width - 2;
    let currentY = height - 2;

    ctx.fillStyle = '#ff0'; 
    while (currentX !== null && currentY !== null) {
        ctx.fillRect(currentX * cellSize + 2, currentY * cellSize + 2, cellSize - 4, cellSize - 4);
        const prev = parent[currentY][currentX];
        currentX = prev ? prev.x : null;
        currentY = prev ? prev.y : null;
    }
}

function drawMaze(clearCanvas = true) {
    if (clearCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            drawCell(j, i, maze[i][j]);
        }
    }
}



document.getElementById('findPathButton').addEventListener('click', findPath);


function isValidMoveForPathfinding(nextX, nextY) {
    if (nextX >= 0 && nextX < width &&
        nextY >= 0 && nextY < height &&
        maze[nextY][nextX] !== WALL &&
        maze[nextY][nextX] !== FREEZE && 
        maze[nextY][nextX] !== SLOWDOWN && 
        maze[nextY][nextX] !== TELEPORT) {
        return true;
    }
    return false;
}


function isValidMoveForPlayer(nextX, nextY) {
    if (nextX >= 0 && nextX < width &&
        nextY >= 0 && nextY < height &&
        maze[nextY][nextX] !== WALL) {
        return true;
    }
    return false;
}


function findPath() {
    const queue = [];
    const visited = Array.from({ length: height }, () => Array(width).fill(false));
    const parent = Array.from({ length: height }, () => Array(width).fill(null));
    
    queue.push({ x: playerX, y: playerY });
    visited[playerY][playerX] = true;

    const directions = [
        { dx: 0, dy: -1 }, 
        { dx: 0, dy: 1 },  
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }  
    ];

    while (queue.length > 0) {
        const { x, y } = queue.shift();


        if (x === width - 2 && y === height - 2) {
            drawPath(parent);
            return;
        }

        for (const { dx, dy } of directions) {
            const nextX = x + dx;
            const nextY = y + dy;

            if (isValidMoveForPathfinding(nextX, nextY) && !visited[nextY][nextX]) {
                visited[nextY][nextX] = true;
                parent[nextY][nextX] = { x, y }; 
                queue.push({ x: nextX, y: nextY });
            }
        }
    }

    messageEl.textContent = 'Путь не найден!';
}


function movePlayer(direction) {
    if (!isFrozen) { 
        let nextX = playerX;
        let nextY = playerY;
        
        switch(direction) {
            case 'left':
                nextX--;
                break;
            case 'right':
                nextX++;
                break;
            case 'up':
                nextY--;
                break;
            case 'down':
                nextY++;
                break;
        }

        if (isValidMoveForPlayer(nextX, nextY)) {
            updatePlayerPosition(nextX, nextY);
            handleObstacle(nextX, nextY);
        }

        drawMaze();
        drawPlayer();
    }
}


document.addEventListener('keydown', function(event) {
    const keyCode = event.keyCode;
    switch(keyCode) {
        case 37: 
            movePlayer('left');
            break;
        case 38: 
            movePlayer('up');
            break;
        case 39: 
            movePlayer('right');
            break;
        case 40: 
            movePlayer('down');
            break;
    }
});


document.getElementById('findPathButton').addEventListener('click', findPath);


drawMaze();
drawPlayer();


