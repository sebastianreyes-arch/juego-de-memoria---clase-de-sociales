// === HISTORIA INICIAL ===
const introScreen = document.getElementById('introScreen');
const startStoryBtn = document.getElementById('startStoryBtn');
const gameContainer = document.getElementById('gameContainer');

startStoryBtn.addEventListener('click', () => {
  introScreen.classList.add('fade-out');
  setTimeout(() => {
    introScreen.style.display = 'none';
    gameContainer.style.display = 'block';
  }, 1000);
});

// === PANTALLA EDUCATIVA ===
const infoScreen = document.getElementById('infoScreen');
const infoText = document.getElementById('infoText');
const continueBtn = document.getElementById('continueBtn');

const earthquakeFacts = [
  "Los terremotos ocurren por el movimiento repentino de las placas tectónicas bajo la superficie terrestre.",
  "La magnitud mide la energía liberada por un sismo, mientras que la intensidad describe cómo se siente en la superficie.",
  "Las zonas de subducción, donde una placa se hunde bajo otra, suelen generar los terremotos más fuertes.",
  "Los edificios antisísmicos están diseñados para resistir vibraciones y reducir los daños durante un sismo.",
  "Después de un terremoto principal pueden ocurrir réplicas, que son movimientos más pequeños en la misma zona."
];

function showInfoScreen(level) {
  infoText.textContent = earthquakeFacts[level - 1] || "Has aprendido mucho sobre los terremotos. ¡Gran trabajo!";
  infoScreen.style.display = "flex";
  gameContainer.style.filter = "blur(5px)";
}

continueBtn.addEventListener("click", () => {
  infoScreen.style.display = "none";
  gameContainer.style.filter = "none";
  generateCards(currentLevel);
});

// === PANTALLA DE DERROTA ===
const loseScreen = document.getElementById('loseScreen');
const retryBtn = document.getElementById('retryBtn');

retryBtn.addEventListener('click', () => {
  loseScreen.style.display = 'none';
  currentLevel = 1;
  generateCards(currentLevel);
});

// === PANTALLA DE VICTORIA ===
const winScreen = document.getElementById('winScreen');
const playAgainBtn = document.getElementById('playAgainBtn');

playAgainBtn.addEventListener('click', () => {
  winScreen.style.display = 'none';
  currentLevel = 1;
  generateCards(currentLevel);
});

// === JUEGO PRINCIPAL ===
const board = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const movesText = document.getElementById('moves');
const message = document.getElementById('message');
const timerText = document.getElementById('timer');
const scoreList = document.getElementById('scoreList');
const levelDisplay = document.getElementById('levelDisplay');

// Sonidos
const soundAcierto = document.getElementById('soundAcierto');
const soundError = document.getElementById('soundError');
const soundGanar = document.getElementById('soundGanar');
const soundPerder = document.getElementById('soundPerder');
const soundAmbiente = document.getElementById('soundAmbiente'); // 🎵 nuevo sonido de fondo

let icons = ['🌋','🏚️','💥','🌎','🚨','🏥','🧯','🪨','🧱','⚡','🔥','🏗️'];
let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let matched = 0;
let totalPairs = 0;
let timeLeft = 0;
let timer;
let gameStarted = false;
let currentLevel = 1;
const maxLevel = 5;

function generateCards(level) {
  board.innerHTML = '';
  message.textContent = '';
  moves = 0;
  matched = 0;
  movesText.textContent = moves;
  gameStarted = true;
  levelDisplay.textContent = level;

  totalPairs = level + 2;
  let selectedIcons = icons.slice(0, totalPairs);
  cards = [...selectedIcons, ...selectedIcons];
  cards.sort(() => 0.5 - Math.random());

  board.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cards.length))}, 1fr)`;

  cards.forEach(icon => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="front">❗</div>
      <div class="back">${icon}</div>
    `;
    card.addEventListener('click', () => flipCard(card, icon));
    board.appendChild(card);
  });

  // 🎧 Reproducir sonido ambiente
  soundAmbiente.currentTime = 0;
  soundAmbiente.volume = 0.4;
  soundAmbiente.play();

  setTimer();
}

function setTimer() {
  clearInterval(timer);
  timeLeft = 40;
  timerText.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function flipCard(card, icon) {
  if (lock || card.classList.contains('flipped') || !gameStarted) return;
  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = { card, icon };
  } else {
    secondCard = { card, icon };
    checkMatch();
  }
}

function checkMatch() {
  lock = true;
  moves++;
  movesText.textContent = moves;

  if (firstCard.icon === secondCard.icon) {
    soundAcierto.play();
    matched++;
    resetSelection();
    if (matched === totalPairs) {
      clearInterval(timer);
      nextLevel();
    }
  } else {
    soundError.play();
    board.classList.add('shake');
    setTimeout(() => {
      board.classList.remove('shake');
      firstCard.card.classList.remove('flipped');
      secondCard.card.classList.remove('flipped');
      resetSelection();
    }, 700);
  }
}

function resetSelection() {
  [firstCard, secondCard] = [null, null];
  lock = false;
}

function nextLevel() {
  soundGanar.play();
  saveScore();

  if (currentLevel < maxLevel) {
    message.textContent = `🎉 Nivel ${currentLevel} completado.`;
    setTimeout(() => {
      currentLevel++;
      showInfoScreen(currentLevel);
    }, 1500);
  } else {
    // Último nivel completado: detener sonido y mostrar victoria
    soundAmbiente.pause();
    soundAmbiente.currentTime = 0;
    clearInterval(timer);
    message.textContent = "🏆 ¡Felicidades, el terremoto está bajo control!";
    setTimeout(() => {
      winScreen.style.display = 'flex';
    }, 1500);
  }
}

function gameOver() {
  gameStarted = false;
  clearInterval(timer);
  soundAmbiente.pause(); // detener ambiente
  soundPerder.play(); // sonido de derrota
  loseScreen.style.display = 'flex';
}

function saveScore() {
  const score = { level: currentLevel, moves, time: 60 - timeLeft };
  let savedScores = JSON.parse(localStorage.getItem('earthquakeScores')) || [];
  savedScores.push(score);
  savedScores.sort((a, b) => a.moves - b.moves || a.time - b.time);
  savedScores = savedScores.slice(0, 5);
  localStorage.setItem('earthquakeScores', JSON.stringify(savedScores));
  renderScores();
}

function renderScores() {
  const savedScores = JSON.parse(localStorage.getItem('earthquakeScores')) || [];
  scoreList.innerHTML = savedScores
    .map(s => `<li>Nivel ${s.level} - ${s.moves} movs, ${s.time}s</li>`)
    .join('');
}

startBtn.addEventListener('click', () => generateCards(currentLevel));
restartBtn.addEventListener('click', () => generateCards(currentLevel));
renderScores();
