const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game objects
const paddle = {
  width: 12,
  height: 100,
  speed: 8,
};

const player = {
  x: 10,
  y: HEIGHT / 2 - paddle.height / 2,
  ...paddle,
};

const ai = {
  x: WIDTH - paddle.width - 10,
  y: HEIGHT / 2 - paddle.height / 2,
  ...paddle,
  speed: 5,
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT / 2,
  radius: 10,
  speed: 6,
  velocityX: 6 * (Math.random() > 0.5 ? 1 : -1),
  velocityY: 6 * (Math.random() * 2 - 1),
};

// Track mouse for player paddle
canvas.addEventListener('mousemove', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  player.y = Math.max(0, Math.min(mouseY - player.height / 2, HEIGHT - player.height));
});

// Draw functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#fff4";
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  // Clear canvas
  drawRect(0, 0, WIDTH, HEIGHT, "#000");
  drawNet();
  // Draw paddles
  drawRect(player.x, player.y, player.width, player.height, "#0ff");
  drawRect(ai.x, ai.y, ai.width, ai.height, "#f0f");
  // Draw ball
  drawCircle(ball.x, ball.y, ball.radius, "#fff");
}

// Update game objects
function update() {
  // Move ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Ball collision with top and bottom walls
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= HEIGHT) {
    ball.velocityY *= -1;
    ball.y = Math.max(ball.radius, Math.min(ball.y, HEIGHT - ball.radius));
  }

  // Ball collision with paddles
  let paddleHit = null;
  if (ball.x - ball.radius <= player.x + player.width &&
      ball.y >= player.y &&
      ball.y <= player.y + player.height) {
    paddleHit = player;
  } else if (ball.x + ball.radius >= ai.x &&
             ball.y >= ai.y &&
             ball.y <= ai.y + ai.height) {
    paddleHit = ai;
  }

  if (paddleHit) {
    // Calculate hit position
    let collidePoint = (ball.y - (paddleHit.y + paddleHit.height/2)) / (paddleHit.height/2);
    // Max bounce angle: 60deg
    let angleRad = collidePoint * (Math.PI/3);
    let direction = (paddleHit === player) ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    // Slightly increase speed after each hit
    ball.speed += 0.1;
  }

  // Ball out of bounds (reset)
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) {
    // Reset ball to center
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = 6;
    // Randomize direction
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() * 2 - 1);
  }

  // AI paddle movement (basic tracking)
  let aiCenter = ai.y + ai.height / 2;
  if (ball.y < aiCenter - 10) {
    ai.y -= ai.speed;
  } else if (ball.y > aiCenter + 10) {
    ai.y += ai.speed;
  }
  // Clamp AI within canvas
  ai.y = Math.max(0, Math.min(ai.y, HEIGHT - ai.height));
}

// Main loop
function game() {
  update();
  draw();
  requestAnimationFrame(game);
}

game();