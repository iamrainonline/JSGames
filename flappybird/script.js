class FlappyBird {
  constructor() {
    this.initializeElements();
    this.initializeState();
    this.setupEventListeners();
  }

  initializeElements() {
    this.gameContainer = document.querySelector(".game-container");
    this.bird = document.querySelector("#bird");
    this.scoreDisplays = document.querySelectorAll(".score, #score");
    this.highScoreDisplay = document.querySelector("#highScore");
    this.attemptsDisplay = document.querySelector("#attempts");
    this.startScreen = document.querySelector(".screen");
    this.message = document.querySelector(".message");
    this.pauseBtn = document.querySelector("#pauseBtn");
    this.speedDisplay = document.querySelector("#speedValue");
  }

  initializeState() {
    this.gameWidth = 800;
    this.gameHeight = 600;
    this.birdX = 150;
    this.birdY = 250;
    this.birdVelocity = 0;
    this.birdGravity = 0.35;
    this.birdLift = -6.5;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("highScore")) || 0;
    this.attempts = parseInt(localStorage.getItem("attempts")) || 0;
    this.pipes = [];
    this.gameLoop = null;
    this.gameStarted = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.pipeSpeed = 2;
    this.speedMultiplier = 1;

    this.updateDisplays();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!this.gameStarted) {
          this.startGame();
        }
        this.jump();
      } else if (e.code === "Escape") {
        this.togglePause();
      }
    });

    this.gameContainer.addEventListener("click", () => {
      if (!this.gameStarted) {
        this.startGame();
      }
      this.jump();
    });

    this.pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePause();
    });
  }

  togglePause() {
    if (!this.gameStarted || this.isGameOver) return;

    this.isPaused = !this.isPaused;
    this.pauseBtn.innerHTML = this.isPaused
      ? '<i class="fas fa-play"></i> Resume'
      : '<i class="fas fa-pause"></i> Pause';

    if (this.isPaused) {
      cancelAnimationFrame(this.gameLoop);
      this.showMessage("PAUSED");
    } else {
      this.hideMessage();
      this.update();
    }
  }

  showMessage(text, duration = 0) {
    this.message.textContent = text;
    this.message.classList.add("show");
    if (duration > 0) {
      setTimeout(() => this.hideMessage(), duration);
    }
  }

  hideMessage() {
    this.message.classList.remove("show");
  }

  increaseSpeed() {
    if (this.speedMultiplier < 2) {
      this.speedMultiplier += 0.25;
      this.updateSpeedDisplay();
    }
  }

  decreaseSpeed() {
    if (this.speedMultiplier > 0.5) {
      this.speedMultiplier -= 0.25;
      this.updateSpeedDisplay();
    }
  }

  updateSpeedDisplay() {
    this.speedDisplay.textContent = `${this.speedMultiplier}x`;
  }

  updateDisplays() {
    this.scoreDisplays.forEach((display) => (display.textContent = this.score));
    this.highScoreDisplay.textContent = this.highScore;
    this.attemptsDisplay.textContent = this.attempts;
  }

  startGame() {
    this.attempts++;
    localStorage.setItem("attempts", this.attempts);
    this.updateDisplays();

    // Clean up any existing pipes
    this.pipes.forEach((pipe) => {
      if (pipe.topPipe.parentNode) pipe.topPipe.remove();
      if (pipe.bottomPipe.parentNode) pipe.bottomPipe.remove();
    });

    this.gameStarted = true;
    this.isGameOver = false;
    this.isPaused = false;
    this.startScreen.style.display = "none";
    this.score = 0;
    this.birdY = 250;
    this.birdVelocity = 0;
    this.pipes = [];

    this.showMessage("GO!", 1000);

    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    this.createPipe();
    this.update();
  }

  jump() {
    if (this.isGameOver || this.isPaused) return;
    this.birdVelocity = this.birdLift;
  }

  createPipe() {
    const gap = 190;
    const minHeight = 50;
    const maxHeight = this.gameHeight - gap - minHeight - 100;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;

    const topPipe = document.createElement("div");
    topPipe.className = "pipe pipe-top";
    topPipe.style.right = "-60px";
    topPipe.style.height = `${height}px`;
    topPipe.style.top = "0";

    const bottomPipe = document.createElement("div");
    bottomPipe.className = "pipe pipe-bottom";
    bottomPipe.style.right = "-60px";
    bottomPipe.style.height = `${this.gameHeight - height - gap - 100}px`;
    bottomPipe.style.bottom = "100px";

    this.gameContainer.appendChild(topPipe);
    this.gameContainer.appendChild(bottomPipe);

    this.pipes.push({
      x: this.gameWidth,
      topPipe,
      bottomPipe,
      scored: false,
    });
  }

  update() {
    if (this.isGameOver || this.isPaused) return;

    // Update bird
    this.birdVelocity += this.birdGravity;
    this.birdY += this.birdVelocity;

    // Ground collision
    if (this.birdY > this.gameHeight - 130) {
      this.gameOver();
      return;
    }

    // Ceiling collision
    if (this.birdY < 0) {
      this.birdY = 0;
      this.birdVelocity = 0;
    }

    // Update bird position and rotation
    const rotation = Math.max(-20, Math.min(20, this.birdVelocity * 2));
    this.bird.style.transform = `translateY(${this.birdY}px) rotate(${rotation}deg)`;

    // Update pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.pipeSpeed * this.speedMultiplier;

      pipe.topPipe.style.right = `${this.gameWidth - pipe.x}px`;
      pipe.bottomPipe.style.right = `${this.gameWidth - pipe.x}px`;

      // Check collision with reduced collision box
      const birdBox = {
        left: this.birdX + 5, // Reduced collision box
        right: this.birdX + 29, // Reduced collision box
        top: this.birdY + 5, // Reduced collision box
        bottom: this.birdY + 19, // Reduced collision box
      };

      const pipeBox = {
        left: pipe.x - 2, // Reduced collision box
        right: pipe.x + 58, // Reduced collision box
        topBottom: parseInt(pipe.topPipe.style.height),
        bottomTop:
          this.gameHeight - parseInt(pipe.bottomPipe.style.height) - 100,
      };

      // Collision detection
      if (
        birdBox.right > pipeBox.left &&
        birdBox.left < pipeBox.right &&
        (birdBox.top < pipeBox.topBottom || birdBox.bottom > pipeBox.bottomTop)
      ) {
        this.gameOver();
        return;
      }

      // Score point
      if (!pipe.scored && pipe.x < this.birdX) {
        pipe.scored = true;
        this.score++;
        this.updateDisplays();
        this.showMessage("+1", 500);
      }

      // Remove pipes that are off screen
      if (pipe.x < -60) {
        this.gameContainer.removeChild(pipe.topPipe);
        this.gameContainer.removeChild(pipe.bottomPipe);
        this.pipes.splice(i, 1);
      }
    }

    // Create new pipes
    if (
      this.pipes.length === 0 ||
      this.pipes[this.pipes.length - 1].x < this.gameWidth - 300
    ) {
      this.createPipe();
    }

    this.gameLoop = requestAnimationFrame(() => this.update());
  }

  gameOver() {
    this.isGameOver = true;
    cancelAnimationFrame(this.gameLoop);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.score);
      this.showMessage("NEW HIGH SCORE!", 2000);
    }

    // Create and show game over screen
    const gameOverScreen = document.createElement("div");
    gameOverScreen.className = "screen";
    gameOverScreen.innerHTML = `
                <h1>Game Over!</h1>
                <div style="text-align: center; margin: 20px 0;">
                    <p style="font-size: 24px; margin-bottom: 10px;">Score: ${this.score}</p>
                    <p style="font-size: 20px;">High Score: ${this.highScore}</p>
                    <p style="font-size: 16px; margin-top: 10px;">Total Attempts: ${this.attempts}</p>
                </div>
                <button class="control-btn" onclick="game.restart()">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            `;

    this.gameContainer.appendChild(gameOverScreen);
  }

  restart() {
    // Remove game over screen if it exists
    const gameOverScreen = this.gameContainer.querySelector(".screen");
    if (gameOverScreen) {
      this.gameContainer.removeChild(gameOverScreen);
    }
    this.startGame();
  }
}

// Initialize the game
const game = new FlappyBird();
