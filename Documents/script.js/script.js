let wordList = ["apple", "tiger", "orange", "piano", "rocket", "planet", "banana", "silver", "bottle", "mirror", "bridge", "circle", "button", "screen", "window"];
let usedWords = [];
let originalWord = "";
let flippedWord = "";
let hintArray = [];
let revealedIndexes = [];
let time = 60;
let level = 1;
let hintsUsed = 0;
let interval;
let attempts = 3;
let winStreak = 0;

const wordDisplay = document.getElementById('wordDisplay');
const hintDisplay = document.getElementById('hintDisplay');
const timerDisplay = document.getElementById('timer');
const status = document.getElementById('status');
const input = document.getElementById('playerInput');

function shuffleWord(word) {
  return word.split('').sort(() => Math.random() - 0.5).join('');
}

function getNewWord() {
  if (usedWords.length === wordList.length) {
    usedWords = []; // Reset used words if all have been used
  }

  let availableWords = wordList.filter(word => !usedWords.includes(word));
  let newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  usedWords.push(newWord);
  return newWord;
}

function startRound() {
  clearInterval(interval);
  time = Math.max(10, 60 - level * 5);
  attempts = 3;
  hintsUsed = 0;
  revealedIndexes = [];
  originalWord = getNewWord();

  do {
    flippedWord = shuffleWord(originalWord);
  } while (flippedWord === originalWord);

  hintArray = Array(originalWord.length).fill("_");

  wordDisplay.textContent = "Flipped: " + flippedWord;
  hintDisplay.textContent = "Hint: " + hintArray.join(" ");
  timerDisplay.textContent = "Time: " + time;
  status.textContent = `You have ${attempts} attempts`;
  input.disabled = false;
  input.value = "";

  startTimer();
}

function startTimer() {
  interval = setInterval(() => {
    time--;
    timerDisplay.textContent = "Time: " + time;
    if (time <= 0) {
      clearInterval(interval);
      input.disabled = true;
      winStreak = 0;
      status.textContent = `⏱ Time's up! The word was: ${originalWord}`;
    }
  }, 1000);
}

function submitGuess() {
  const guess = input.value.trim().toLowerCase();
  if (!guess) {
    status.textContent = "Enter a word before submitting!";
    return;
  }

  if (guess === originalWord) {
    clearInterval(interval);
    winStreak++;
    status.textContent = `✅ Correct! (${winStreak} win${winStreak > 1 ? "s" : ""})`;
    if (winStreak === 5) {
      status.textContent = "🏆 You won 5 rounds in a row! You're the Champion!";
      input.disabled = true;
      return;
    }
    level++;
    setTimeout(() => {
      startRound();
    }, 2000);
  } else {
    attempts--;
    if (attempts > 0) {
      status.textContent = `❌ Wrong! ${attempts} attempt${attempts > 1 ? "s" : ""} left.`;
    } else {
      clearInterval(interval);
      input.disabled = true;
      winStreak = 0;
      status.textContent = `💀 No attempts left! The word was: ${originalWord}`;
    }
  }
}

function giveHint() {
  if (hintsUsed >= 2) {
    status.textContent = "🚫 No more hints available.";
    return;
  }

  let unrevealedIndexes = [];
  for (let i = 0; i < originalWord.length; i++) {
    if (!revealedIndexes.includes(i)) {
      unrevealedIndexes.push(i);
    }
  }

  if (unrevealedIndexes.length === 0) return;

  const randomIndex = unrevealedIndexes[Math.floor(Math.random() * unrevealedIndexes.length)];
  hintArray[randomIndex] = originalWord[randomIndex];
  revealedIndexes.push(randomIndex);
  hintsUsed++;

  hintDisplay.textContent = "Hint: " + hintArray.join(" ");
}

function restartGame() {
  level = 1;
  winStreak = 0;
  usedWords = [];
  startRound();
}

startRound();
