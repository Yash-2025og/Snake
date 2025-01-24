const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20;
const tileCount = 30;
const gameSpeed = 100;  // in milliseconds

// Game state
let snake, direction, food, gameInterval;
let isGameOver = false;
let isPaused = false;  // New flag to check if the game is paused
let username = '';
let currentScore = 0;
let highestScore = 0;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

canvas.width = tileCount * gridSize;
canvas.height = tileCount * gridSize;

// Show start modal
const startModal = document.getElementById('start-modal');
const startButton = document.getElementById('start-btn');
const usernameInput = document.getElementById('username');
const userInfo = document.getElementById('user-info');
const userNameDisplay = document.getElementById('user-name-display');
const currentScoreDisplay = document.getElementById('current-score');
const highestScoreDisplay = document.getElementById('highest-score');
const scoreDisplay = document.getElementById('score-display');

// Load user data from localStorage (if exists)
function loadUserData() {
  const savedUsername = localStorage.getItem('username');
  const savedCurrentScore = localStorage.getItem('currentScore');
  const savedHighestScore = localStorage.getItem('highestScore');

  if (savedUsername) {
    username = savedUsername;
    currentScore = savedCurrentScore ? parseInt(savedCurrentScore) : 0;
    highestScore = savedHighestScore ? parseInt(savedHighestScore) : 0;

    userNameDisplay.textContent = username;
    currentScoreDisplay.textContent = currentScore;
    highestScoreDisplay.textContent = highestScore;

    userInfo.style.display = 'block';
    usernameInput.style.display = 'none';
  }
}

// Start the game
function startGame() {
  if (usernameInput.style.display === 'block' && usernameInput.value.trim() !== '') {
    username = usernameInput.value.trim();
    localStorage.setItem('username', username);
    localStorage.setItem('currentScore', 0);
    localStorage.setItem('highestScore', highestScore);
  }

  startModal.style.display = 'none';  // Hide start modal
  snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
  direction = 'RIGHT';
  food = spawnFood();
  isGameOver = false;
  isPaused = false;  // Game is not paused at the start
  currentScore = 0;
  document.getElementById('restart-btn').style.display = 'none';

  gameInterval = setInterval(updateGame, gameSpeed);
}

// Show modal when the page loads
startModal.style.display = 'flex';
loadUserData();

// Event listener to start the game when the user clicks the start button
startButton.addEventListener('click', startGame);

// Update game logic
function updateGame() {
  if (isPaused) return;  // Skip the game update if it's paused

  const head = { ...snake[0] };

  if (direction === 'UP') head.y -= 1;
  if (direction === 'DOWN') head.y += 1;
  if (direction === 'LEFT') head.x -= 1;
  if (direction === 'RIGHT') head.x += 1;

  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;

  if (isCollisionWithSnake(head)) {
    endGame();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    food = spawnFood();
    currentScore++;
    if (currentScore > highestScore) {
      highestScore = currentScore;
      localStorage.setItem('highestScore', highestScore);
    }
  } else {
    snake.unshift(head);
    snake.pop();
  }

  renderGame();
  updateScores();
}

// Render the game on the canvas
function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#808080';  // Grey color for grid lines
  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }

  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  ctx.fillStyle = 'lime';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });
}

// Check if the snake collides with itself
function isCollisionWithSnake(head) {
  return snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y);
}

// Generate random food position
function spawnFood() {
  let foodPos;
  do {
    foodPos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (isCollisionWithSnake(foodPos));
  return foodPos;
}

// Handle key presses to change snake direction
document.addEventListener('keydown', (e) => {
  if (isGameOver || isPaused) return;  // Ignore inputs if game is over or paused

  if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// End the game and show the restart button
function endGame() {
  clearInterval(gameInterval);
  isGameOver = true;
  document.getElementById('restart-btn').style.display = 'block';

  // Update leaderboard
  leaderboard.push({ username, highestScore });
  leaderboard.sort((a, b) => b.highestScore - a.highestScore);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Restart the game
document.getElementById('restart-btn').addEventListener('click', startGame);

// Pause the game
document.getElementById('pause-btn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pause-btn').textContent = isPaused ? 'Resume Game' : 'Pause Game';
});

// Update and display the current score and highest score
function updateScores() {
  currentScoreDisplay.textContent = currentScore;
  highestScoreDisplay.textContent = highestScore;
}

// Show leaderboard modal
document.getElementById('leaderboard-btn').addEventListener('click', () => {
  const leaderboardList = document.getElementById('leaderboard-list');
  leaderboardList.innerHTML = '';

  leaderboard.forEach((entry, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${entry.username}: ${entry.highestScore}`;
    leaderboardList.appendChild(listItem);
  });

  document.getElementById('leaderboard-modal').style.display = 'flex';
});

// Close leaderboard modal
document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
  document.getElementById('leaderboard-modal').style.display = 'none';
});
