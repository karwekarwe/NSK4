let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

let playerName = "";
let moves = 0;
let gameStartTime;
let difficulty = "Lengvas"; 

const cardData = {
  Lengvas: 6,    
  Vidutinis: 10, 
  Sunkus: 15,   
};

const moveCounter = document.getElementById("move-counter");

document.getElementById("start-game").addEventListener("click", () => {
  const nameInput = document.getElementById("player-name");
  if (nameInput.value.trim() === "") {
    alert("Įveskite vardą!");
    return;
  }

  playerName = nameInput.value.trim();
  difficulty = document.getElementById("difficulty").value;

  document.getElementById("player-display").textContent = `Žaidėjas: ${playerName} | Sudėtingumo lygis: ${difficulty}`;
  document.getElementById("moves-container").style.display = "block";

  document.getElementById("game-section").setAttribute("data-difficulty", difficulty);

  generateCards(cardData[difficulty]);

  document.getElementById("player-setup").style.display = "none";
  document.getElementById("game-section").style.display = "block";
  document.getElementById("leaderboard-section").style.display = "block"; 

  displayTopScores(difficulty);
});

function generateCards(pairs) {
  const memoryGame = document.getElementById("memory-game");
  memoryGame.innerHTML = ""; 

  const frameworks = ["ate", "cat", "cheek", "dantis", "kareivux", "liux", "melagis", "omnomnom", "piktc", "ranka", "roze", "sirdute", "uwu", "zvaigzde", "beisbol"];

  const selectedFrameworks = frameworks.slice(0, pairs);

  const cardsArray = selectedFrameworks
    .concat(selectedFrameworks) 
    .sort(() => Math.random() - 0.5); 

  cardsArray.forEach((framework) => {
    const card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.framework = framework;

    card.innerHTML = `
      <img class="front-face" src="img/${framework}.png" alt="${framework}" />
      <div class="back-face"></div>
    `;

    memoryGame.appendChild(card);
  });


  const cards = document.querySelectorAll(".memory-card");
  cards.forEach((card) => card.addEventListener("click", flipCard));
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flip");

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

  isMatch ? disableCards() : unflipCards();

  moves++;
  moveCounter.textContent = moves;

  if (gameStartTime === undefined) {
    gameStartTime = Date.now();
  }

  if (allCardsMatched()) {
    updateBestScore();
    setTimeout(() => {
      alert(`Šaunu, ${playerName}! Perėjai žaidimą ${moves} ėjimais.`);
    }, 500);
  }
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;

  setTimeout(() => {
    firstCard.classList.remove("flip");
    secondCard.classList.remove("flip");
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function allCardsMatched() {
  return document.querySelectorAll(".memory-card:not(.flip)").length === 0;
}

function updateBestScore() {
  const currentTime = Date.now() - gameStartTime;
  const currentScoreTime = Math.floor(currentTime / 1000);
  const currentScore = `${moves} ėjimai per ${currentScoreTime} s.`;

  updateTopScores(playerName, moves, currentScoreTime);

}

function parseScore(score) {
  const [moves, time] = score.match(/\d+/g).map(Number);
  return moves * 1000 + time;
}

function getTopScores(difficulty) {
  return JSON.parse(sessionStorage.getItem(`topScores-${difficulty}`)) || [];
}

function updateTopScores(playerName, moves, time) {
  let topScores = getTopScores(difficulty);

  topScores.push({ name: playerName, moves, time });

  topScores.sort((a, b) => a.moves - b.moves || a.time - b.time);

  topScores = topScores.slice(0, 3);

  sessionStorage.setItem(`topScores-${difficulty}`, JSON.stringify(topScores));

  displayTopScores(difficulty);
}

function displayTopScores(difficulty) {
  const leaderboard = document.getElementById("leaderboard");
  const topScores = getTopScores(difficulty);

  leaderboard.innerHTML = "";
  if (topScores.length === 0) {
    leaderboard.innerHTML = "<li> Nėra įrašų</li>";
  } else {
    topScores.forEach((score, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${score.name} - ${score.moves} ėjimai per ${score.time} s.`;
      leaderboard.appendChild(li);
    });
  }
}

function resetGame() {
  moves = 0;
  gameStartTime = undefined;
  moveCounter.textContent = moves;

  const memoryGame = document.getElementById("memory-game");
  memoryGame.innerHTML = ""; 


  generateCards(cardData[difficulty]);
}

(function shuffle() {
  const cards = document.querySelectorAll(".memory-card");
  cards.forEach((card) => {
    let randomPos = Math.floor(Math.random() * 12);
    card.style.order = randomPos;
  });
})();

document.getElementById("play-again").addEventListener("click", () => {
  resetGame();
  document.getElementById("game-section").style.display = "none";
  document.getElementById("player-setup").style.display = "block";
  document.getElementById("play-again").style.display = "none";
});
