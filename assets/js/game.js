import * as config from './config.js';

let player;
let obstacles = [];
let gameContainer;
let score = 0;
let gameSpeed = config.initialGameSpeed;
let obstacleSpawnInterval = config.initialObstacleSpawnInterval;
let lastObstacleSpawnTime = 0;
let isJumping = false;
let playerPosition;
let obstacleMoveInterval;

export function initializeGame() {
    player = document.getElementById('player');
    gameContainer = document.getElementById('game-container');

    document.addEventListener('keydown', handleKeyDown);
    playerPosition = parseInt(window.getComputedStyle(player).left);

    obstacleMoveInterval = setInterval(moveObstacles, config.obstacleMoveInterval);
    gameSpeed = config.initialGameSpeed;
    obstacleSpawnInterval = config.initialObstacleSpawnInterval;
    lastObstacleSpawnTime = 0;

    // Inicia o spawn de obstáculos
    spawnObstacles();
    console.log("Game initialized");

    // Atualiza a pontuação a cada 100ms
    setInterval(updateScore, 100);

    // Aumenta a dificuldade a cada 10 segundos
    setInterval(increaseDifficulty, 5000);

    setInterval(spawnBonusItem, getRandomInterval(5000, 10000)); // Entre 5 e 10 segundos
}

export function playCoinSound() {
    const audio = new Audio('coin.mp3'); // Caminho do arquivo de som
    audio.volume = 0.5; // Ajusta o volume (opcional)
    audio.play();
}


function increaseDifficulty() {
    gameSpeed += 1; // Aumenta a velocidade dos obstáculos
    obstacleSpawnInterval = Math.max(500, obstacleSpawnInterval - 100); // Reduz o intervalo de spawn, mínimo de 500ms

    console.log(`Game Speed: ${gameSpeed}, Obstacle Spawn Interval: ${obstacleSpawnInterval}`);
}

function spawnBonusItem() {
    const bonusItem = document.createElement('div');
    bonusItem.classList.add('bonus-item'); // Adicione a estilização no CSS
    bonusItem.style.left = Math.random() * (gameContainer.offsetWidth - 50) + 'px'; // Posição aleatória
    bonusItem.style.top = '0px';

    gameContainer.appendChild(bonusItem);

    function moveBonus() {
        let currentTop = parseInt(bonusItem.style.top) || 0;
        bonusItem.style.top = (currentTop + gameSpeed) + 'px';

        if (checkCollision(bonusItem)) {
            score += 100; // Adiciona 100 pontos
            playCoinSound(); // Toca o som da moeda coletada
            bonusItem.remove();
            console.log("Pegou um bônus! +100 pontos");
        } else if (currentTop < gameContainer.offsetHeight) {
            requestAnimationFrame(moveBonus);
        } else {
            bonusItem.remove(); // Remove se passar da tela
        }
    }

    requestAnimationFrame(moveBonus);
}

function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function handleKeyDown(event) {
    if (event.code === 'Space' && !isJumping) {
        jump();
    }

    // Left and Right arrow keys for lane switching
    if (event.code === 'ArrowLeft') {
        moveLeft();
    }
    if (event.code === 'ArrowRight') {
        moveRight();
    }
}



async function saveScore(username, score) {
    try {
        const response = await fetch('https://evoludesign.com.br/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score })
        });

        const data = await response.json();
        console.log("Pontuação salva:", data);
    } catch (error) {
        console.error("Erro ao salvar pontuação:", error);
    }
}


function jump() {
    isJumping = true;
    let jumpHeight = 100;
    let duration = 300; // Duration of the jump in milliseconds
    let start = null;

    function animateJump(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        let animation = easeOutQuad(progress, 0, jumpHeight, duration); // Use the easing function

        player.style.bottom = animation + 'px';

        if (progress < duration) {
            requestAnimationFrame(animateJump);
        } else {
            player.style.bottom = '20px'; // Reset to ground
            isJumping = false;
        }
    }

    requestAnimationFrame(animateJump);
}

// Easing function (easeOutQuad)
function easeOutQuad(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
}


function moveLeft() {
    let currentLeft = parseInt(window.getComputedStyle(player).left);
    let newLeft = Math.max(currentLeft - config.laneWidth, 0); // Ensure not moving off-screen
    player.style.left = newLeft + 'px';
    playerPosition = newLeft;
}

function moveRight() {
    let currentLeft = parseInt(window.getComputedStyle(player).left);
    let maxLeft = gameContainer.offsetWidth - player.offsetWidth;
    let newLeft = Math.min(currentLeft + config.laneWidth, maxLeft); // Ensure not moving off-screen
    player.style.left = newLeft + 'px';
    playerPosition = newLeft;
}

function spawnObstacles() {
    setInterval(() => {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');

        // Randomly position the obstacle on one of the lanes
        obstacle.style.left = Math.random() * (gameContainer.offsetWidth - 50) + 'px'; // Ensure it's within the container

        obstacle.style.top = '0px'; // Start from the top
        gameContainer.appendChild(obstacle);
        obstacles.push(obstacle);

        // Remove the obstacle after it goes off-screen
        setTimeout(() => {
            obstacle.remove();
            obstacles = obstacles.filter(obs => obs !== obstacle);
        }, 10000); // Adjust time as needed
    }, obstacleSpawnInterval); // Adjust spawn rate as needed
}


function moveObstacles() {
    obstacles.forEach(obstacle => {
        let currentTop = parseInt(obstacle.style.top) || 0;
        obstacle.style.top = (currentTop + gameSpeed) + 'px';

        // Check for collision
        if (checkCollision(obstacle)) {
            gameOver();
        }
    });
}


function checkCollision(obstacle) {
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    return !(playerRect.right < obstacleRect.left ||
        playerRect.left > obstacleRect.right ||
        playerRect.bottom < obstacleRect.top ||
        playerRect.top > obstacleRect.bottom);
}


function gameOver() {
    clearInterval(obstacleMoveInterval);
    alert('Game Over! Your score: ' + score);

    const username = prompt("Digite seu nome:");
    if (username) {
        saveScore(username, score);
    }

    location.reload(); // Refresh the page to restart
}


function updateScore() {
    score += 1; // Increment score

    // You can display the score on the page if you want
    document.getElementById('score').innerText = 'Score: ' + score;
}
