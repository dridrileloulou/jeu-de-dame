// Events 
document.addEventListener("mousemove", logMouse)
//document.addEventListener("mousedown", clickMouse)


// Values we use
let value = 0
let canva = document.getElementById("canvas");
canva.addEventListener("mousedown", clickMouse)
console.log(canva.width)

// We get the position of the mouse
let positon = document.getElementById("position")
let positonClick = document.getElementById("positionClick")

// Useful grids to draw
let colorGrid = [
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
]
let playerGrid = [
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
]


// Initialisation of the size of a tile
const tileSize = 50;

// A button to test
button = document.getElementById("button");

function add() {
    value++;
    button.innerHTML = "Valeur: " + value;
}

function drawGrid() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
 
    for (let y = 0; y < colorGrid.length; y++) {
        for (let x = 0; x < colorGrid[y].length + 10; x++) {
            if (colorGrid[y][x] == 1) {
                ctx.fillStyle = "brown";
                ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
            } 
            if (colorGrid[y][x] == 2) {
                ctx.fillStyle = "gray";
                ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
            } 
        }
    }
}

function drawPlayer() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < colorGrid.length; y++) {
        for (let x = 0; x < colorGrid[y].length; x++) {
            if (playerGrid[y][x] == 1) {
                ctx.fillStyle = "black"
                const circle = new Path2D();
                circle.arc(tileSize/2 +x*tileSize, tileSize/2 + y*tileSize, 20, 0, 2*Math.PI)
                ctx.fill(circle)
            } 
            if (playerGrid[y][x] == 2) {
                ctx.fillStyle = "white"
                const circle = new Path2D();
                circle.arc(tileSize/2 +x*tileSize, tileSize/2 + y*tileSize, 20, 0, 2*Math.PI)
                ctx.fill(circle)
            }  
        }
    }
}

drawGrid();
drawPlayer();

function logMouse(e) {
    positon.innerHTML = "Position: " + e.screenX + "/" + e.screenY;
}

function clickMouse(e) {
    positonClick.innerHTML = "Position du click: " + e.clientX + "/" + e.clientY;
    playAMove(e.offsetX, e.offsetY)
}

function playAMove(x, y) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    for (let j = 0; j < playerGrid.length; j++) {
        for (let i = 0; i < playerGrid[j].length; i++) {
            let posX = Math.floor(x/tileSize); 
            let posY = Math.floor(y/tileSize);

            if (playerGrid[posY][posX] == 1) {
                console.log("Black played !")
                let newX = posX + 1;
                let newY = posY + 1;
                playerGrid[posY][posX] = 0;
                playerGrid[newY][newX] = 1;
                ctx.clearRect(posX*tileSize, posY*tileSize, 50, 50)
                drawGrid()
                drawPlayer()
            } else if (playerGrid[posY][posX] == 2) {
                console.log("White played")
                let newX = posX;
                let newY = posY - 1;
                playerGrid[posY][posX] = 0;
                playerGrid[newY][newX] = 2;
                ctx.clearRect(posX*tileSize, posY*tileSize, 50, 50)
                drawGrid()
                drawPlayer()
            } else {
                console.log("No pawn here")
            }
        }
    }
}
