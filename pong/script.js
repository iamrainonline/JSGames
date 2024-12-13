class PongGame {
  constructor() {
    this.initializeElements();
    this.initializeState();
    this.setupEventListeners();
    this.resize();
  }

  initializeElements() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.playerScoreDisplay = document.getElementById("playerScore");
    this.aiScoreDisplay = document.getElementById("aiScore");
    this.rallyDisplay = document.getElementById("rally");
    this.startScreen = document.querySelector(".screen");
    this.message = document.querySelector(".message");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.speedDisplay = document.getElementById("speedValue");
  }

  initializeState() {
    // Canvas dimensions
    this.width = 800;
    this.height = 500;

    // Paddle dimensions
    this.paddleWidth = 12;
    this.paddleHeight = 80;
    this.paddleSpeed = 8;

    // Ball properties
    this.ballSize = 8;
    this.ballSpeed = 5;
    this.speedMultiplier = 1;

    // Game state
    this.playerY = this.height / 2 - this.paddleHeight / 2;
    this.aiY = this.height / 2 - this.paddleHeight / 2;
    this.ballX = this.width / 2;
    this.ballY = this.height / 2;
    this.ballVelX = 0;
    this.ballVelY = 0;
    this.playerScore = 0;
    this.aiScore = 0;
    this.rallyCount = 0;

    this.gameStarted = false;
    this.isPaused = false;
    this.isGameOver = false;

    // Update displays
    this.updateDisplays();
  }

  setupEventListeners() {
    // Mouse movement
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.gameStarted && !this.isPaused) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        this.playerY = Math.max(
          0,
          Math.min(this.height - this.paddleHeight, mouseY)
        );
      }
    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.gameStarted || this.isPaused) return;

      if (e.key === "w" || e.key === "W") {
        this.playerY = Math.max(0, this.playerY - this.paddleSpeed);
      }
      if (e.key === "s" || e.key === "S") {
        this.playerY = Math.min(
          this.height - this.paddleHeight,
          this.playerY + this.paddleSpeed
        );
      }
      if (e.code === "Space") {
        this.togglePause();
      }
    });

    // Pause button
    this.pauseBtn.addEventListener("click", () => this.togglePause());

    // Window resize
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx.scale(1, 1);
  }

  startGame() {
    this.gameStarted = true;
    this.isGameOver = false;
    this.startScreen.style.display = "none";
    this.resetBall();
    this.showMessage("GO!", 1000);
    this.update();
  }

  resetBall() {
    this.ballX = this.width / 2;
    this.ballY = this.height / 2;
    this.ballVelX = (Math.random() > 0.5 ? 1 : -1) * this.ballSpeed;
    this.ballVelY = (Math.random() * 2 - 1) * this.ballSpeed;
  }

  togglePause() {
    if (!this.gameStarted || this.isGameOver) return;

    this.isPaused = !this.isPaused;
    this.pauseBtn.innerHTML = this.isPaused
      ? '<i class="fas fa-play"></i> Resume'
      : '<i class="fas fa-pause"></i> Pause';

    if (!this.isPaused) this.update();
    this.showMessage(this.isPaused ? "PAUSED" : "");
  }

  showMessage(text, duration = 0) {
    this.message.textContent = text;
    this.message.classList.add("show");
    if (duration > 0) {
      setTimeout(() => this.message.classList.remove("show"), duration);
    }
  }

  updateDisplays() {
    this.playerScoreDisplay.textContent = this.playerScore;
    this.aiScoreDisplay.textContent = this.aiScore;
    this.rallyDisplay.textContent = this.rallyCount;
  }

  increaseSpeed() {
    if (this.speedMultiplier < 2) {
      this.speedMultiplier += 0.25;
      this.speedDisplay.textContent = `${this.speedMultiplier}x`;
    }
  }

  decreaseSpeed() {
    if (this.speedMultiplier > 0.5) {
      this.speedMultiplier -= 0.25;
      this.speedDisplay.textContent = `${this.speedMultiplier}x`;
    }
  }

  update() {
    if (!this.gameStarted || this.isPaused || this.isGameOver) return;

    // Update ball position
    this.ballX += this.ballVelX * this.speedMultiplier;
    this.ballY += this.ballVelY * this.speedMultiplier;

    // AI movement
    const aiCenter = this.aiY + this.paddleHeight / 2;
    const ballCenter = this.ballY;
    if (Math.abs(aiCenter - ballCenter) > this.paddleSpeed) {
      if (aiCenter < ballCenter) {
        this.aiY += this.paddleSpeed * 0.7 * this.speedMultiplier;
      } else {
        this.aiY -= this.paddleSpeed * 0.7 * this.speedMultiplier;
      }
    }

    // Ball collision with top and bottom
    if (this.ballY <= 0 || this.ballY >= this.height) {
      this.ballVelY = -this.ballVelY;
    }

    // Ball collision with paddles
    if (this.ballX <= this.paddleWidth + 10) {
      if (
        this.ballY >= this.playerY &&
        this.ballY <= this.playerY + this.paddleHeight
      ) {
        this.ballVelX = -this.ballVelX;
        const relativeIntersectY =
          this.playerY + this.paddleHeight / 2 - this.ballY;
        const normalizedRelativeIntersectY =
          relativeIntersectY / (this.paddleHeight / 2);
        this.ballVelY = -normalizedRelativeIntersectY * this.ballSpeed;
        this.rallyCount++;
        this.updateDisplays();
      }
    }

    if (this.ballX >= this.width - this.paddleWidth - 10) {
      if (
        this.ballY >= this.aiY &&
        this.ballY <= this.aiY + this.paddleHeight
      ) {
        this.ballVelX = -this.ballVelX;
        const relativeIntersectY =
          this.aiY + this.paddleHeight / 2 - this.ballY;
        const normalizedRelativeIntersectY =
          relativeIntersectY / (this.paddleHeight / 2);
        this.ballVelY = -normalizedRelativeIntersectY * this.ballSpeed;
        this.rallyCount++;
        this.updateDisplays();
      }
    }

    // Scoring
    if (this.ballX <= 0) {
      this.aiScore++;
      this.rallyCount = 0;
      this.updateDisplays();
      this.showMessage("AI Scores!", 1000);
      this.resetBall();
    }

    if (this.ballX >= this.width) {
      this.playerScore++;
      this.rallyCount = 0;
      this.updateDisplays();
      this.showMessage("Player Scores!", 1000);
      this.resetBall();
    }

    // Check for game over
    if (this.playerScore >= 11 || this.aiScore >= 11) {
      this.gameOver();
      return;
    }

    // Draw everything
    this.draw();

    requestAnimationFrame(() => this.update());
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw center line
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, this.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
    this.ctx.fillStyle = "#fff";
    // Player paddle
    this.ctx.fillRect(10, this.playerY, this.paddleWidth, this.paddleHeight);
    // AI paddle
    this.ctx.fillRect(
      this.width - this.paddleWidth - 10,
      this.aiY,
      this.paddleWidth,
      this.paddleHeight
    );

    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, this.ballSize, 0, Math.PI * 2);
    this.ctx.fillStyle = "#4dc1f9";
    this.ctx.fill();
    this.ctx.closePath();
  }

  gameOver() {
    this.isGameOver = true;
    const winner = this.playerScore > this.aiScore ? "Player" : "AI";

    const gameOverScreen = document.createElement("div");
    gameOverScreen.className = "screen";
    gameOverScreen.innerHTML = `
                <h1>${winner} Wins!</h1>
                <div style="text-align: center; margin: 20px 0;">
                    <p style="font-size: 24px; margin-bottom: 10px;">Final Score</p>
                    <p style="font-size: 20px;">Player: ${this.playerScore} - AI: ${this.aiScore}</p>
                    <p style="font-size: 16px; margin-top: 10px;">Longest Rally: ${this.rallyCount}</p>
                </div>
                <button class="control-btn" onclick="game.restart()">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            `;

    this.gameContainer.appendChild(gameOverScreen);
  }

  restart() {
    // Remove game over screen if it exists
    const gameOverScreen = document.querySelector(".screen");
    if (gameOverScreen) {
      gameOverScreen.remove();
    }

    // Reset game state
    this.playerScore = 0;
    this.aiScore = 0;
    this.rallyCount = 0;
    this.playerY = this.height / 2 - this.paddleHeight / 2;
    this.aiY = this.height / 2 - this.paddleHeight / 2;
    this.speedMultiplier = 1;
    this.speedDisplay.textContent = "1x";
    this.updateDisplays();

    // Start new game
    this.startGame();
  }
}

// Initialize the game
const game = new PongGame();
