const textDisplay = document.getElementById("textDisplay");
const textInput = document.getElementById("textInput");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");

const texts = [
  "The quick brown fox jumps over the lazy dog.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Programming is the art of telling another human what one wants the computer to do.",
];

let currentText = "";
let startTime = null;
let mistakes = 0;

function init() {
  currentText = texts[Math.floor(Math.random() * texts.length)];
  textDisplay.innerHTML = currentText;
  textInput.value = "";
  startTime = null;
  mistakes = 0;
  updateStats();
}

function updateDisplay(typed) {
  let displayText = "";
  for (let i = 0; i < currentText.length; i++) {
    if (i < typed.length) {
      if (typed[i] === currentText[i]) {
        displayText += `<span class="correct">${currentText[i]}</span>`;
      } else {
        displayText += `<span class="incorrect">${currentText[i]}</span>`;
      }
    } else if (i === typed.length) {
      displayText += `<span class="current">${currentText[i]}</span>`;
    } else {
      displayText += currentText[i];
    }
  }
  textDisplay.innerHTML = displayText;
}

function calculateWPM() {
  if (!startTime) return 0;
  const timeElapsed = (Date.now() - startTime) / 1000 / 60;
  const wordsTyped = textInput.value.length / 5;
  return Math.round(wordsTyped / timeElapsed);
}

function calculateAccuracy() {
  if (textInput.value.length === 0) return 100;
  let mistakes = 0;
  const typed = textInput.value;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== currentText[i]) mistakes++;
  }
  return Math.round(((typed.length - mistakes) / typed.length) * 100);
}

function updateStats() {
  wpmDisplay.textContent = calculateWPM();
  accuracyDisplay.textContent = calculateAccuracy();
}

function showCompletion() {
  const message = document.createElement("div");
  message.className = "completion-message";
  message.innerHTML = `
                <h2>Great job!</h2>
                <div class="completion-stats">
                    <div>
                        <h3>${calculateWPM()}</h3>
                        <p>WPM</p>
                    </div>
                    <div>
                        <h3>${calculateAccuracy()}%</h3>
                        <p>Accuracy</p>
                    </div>
                </div>
            `;
  document.body.appendChild(message);

  setTimeout(() => {
    message.remove();
    init();
    textInput.disabled = false;
    textInput.focus();
  }, 2000);
}

textInput.addEventListener("input", () => {
  if (!startTime && textInput.value.length > 0) {
    startTime = Date.now();
  }

  updateDisplay(textInput.value);
  updateStats();

  if (textInput.value.length >= currentText.length) {
    textInput.disabled = true;
    showCompletion();
  }
});

function restart() {
  init();
  textInput.disabled = false;
  textInput.focus();
}

function toggleTheme() {
  document.body.dataset.theme =
    document.body.dataset.theme === "dark" ? "light" : "dark";
  const icon = document.querySelector(".theme-toggle i");
  icon.className =
    document.body.dataset.theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Initialize the game
init();
