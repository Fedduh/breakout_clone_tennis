"use strict";

// ------------------ //
// == BOARD object == //
// ------------------ //
function Board() {
  this.x = 0;
  this.y = 0;
  this.width = 400;
  this.height = 500;
  this.score = 0;
  this.lives = 3;
  this.level = 1;
  // make canvas size equal to board
  canvas.width = this.width;
  canvas.height = this.height;
};

Board.prototype.draw = function () {
  ctx.fillStyle = "#773E2F"; // brown
  ctx.fillRect(0, 0, board.width, board.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"; // white
  ctx.lineWidth = 3;
  ctx.beginPath();
  // big square
  ctx.moveTo(this.x + 10, this.y + 10);
  ctx.lineTo(this.x + 10, this.height - 10);
  ctx.lineTo(this.width - 10, this.height - 10);
  ctx.lineTo(this.width - 10, this.y + 10);
  ctx.lineTo(this.x + 10, this.y + 10);
  // small square
  ctx.moveTo(this.x + 60, this.y + 10);
  ctx.lineTo(this.x + 60, this.height - 10);
  ctx.lineTo(this.width - 60, this.height - 10);
  ctx.lineTo(this.width - 60, this.y + 10);
  ctx.lineTo(this.x + 60, this.y + 10);
  // two horizontal lines
  ctx.moveTo(this.x + 60, this.y + 160);
  ctx.lineTo(this.width - 60, this.y + 160);
  ctx.moveTo(this.x + 60, this.height - 160);
  ctx.lineTo(this.width - 60, this.height - 160);
  // vertical line
  ctx.moveTo(this.width / 2, this.y + 160);
  ctx.lineTo(this.width / 2, this.height - 160);
  ctx.closePath();
  ctx.stroke();
};

Board.prototype.createBlocks = function () {
  blockArray = [];
  for (var j = 1; j < 6; j++) { // 5 high (6)
    var x = 30;
    for (var i = 1; i < 7; i++) { // 6 wide (7)
      var health = Math.floor(Math.random() * 3 + 1); // 0, 1, 2, 3 (4)
      // 20% of block containing powerup
      var powerup = (Math.random() < 0.2 ? true : false);
      if (Math.random() < 0.9) { // 10% no block
        new Block(x, 25 * j, health, powerup);
      }
      x = x + 60;
    }
  }
};

Board.prototype.drawScore = function () {
  $("#points").text(this.score);
};

Board.prototype.drawLives = function () {
  var livesLeft = '';
  for (var i = 1; i <= this.lives; i++) {
    livesLeft += "\u25CF"; //unicode ball; 
  };
  $("#lives").text(livesLeft)
};

Board.prototype.drawLevels = function () {
  $("#levels").text(this.level);
};

Board.prototype.gameOver = function () {
  if (ballArray.length == 0) {
    audioPlay(soundOut);
    console.log(soundOut);
    this.lives--;
    this.drawLives();
    // create new ball
    setTimeout(function () {
      new Ball();
    }, 1500);
  };
  // "real" Game over (no lives left)
  if (board.lives == 0) {
    freezegame = true;
    ctx.fillStyle = "#E8E001";
    ctx.beginPath();
    ctx.arc(this.width / 2, this.height / 2, this.width / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke(); // white border
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", board.width / 2, board.height / 2 - 50);
    ctx.fillText("Score : " + board.score, board.width / 2, board.height / 2);
    ctx.fillText("Level : " + board.level, board.width / 2, board.height / 2 + 50);
  };
};

Board.prototype.goNextLevel = function () {
  this.level++;
  // new level settings
  ballArray = [];
  powerupArray = [];
  this.drawLevels();
  board.createBlocks();
  setTimeout(function () {
    new Ball();
    paddle.speed = 5 + board.level * 0.5;
  }, 5000);
  // audio + animation
  audioPlay(soundWon);
  $(document.body).css({ "background-image": "url(images/crowd.png)" });
  setTimeout(function () {
    $(document.body).css({ "background-image": "none" });
  }, 2000);
};

// ------------------- //
// == PADDLE object == //
// ------------------- //
function Paddle() {
  this.width = 80;
  this.height = 15;
  this.x = board.width / 2 - (this.width / 2);
  this.y = board.height - this.height - 10;
  this.speed = 5 + board.level * 0.5;
};

Paddle.prototype.move = function () {
  if (goLeft) { this.x = (this.x <= 5 ? 5 : this.x - this.speed) };
  if (goRight) { this.x = (this.x + this.width >= board.width - 5 ? board.width - 5 - this.width : this.x + this.speed) };
};

Paddle.prototype.draw = function () {
  ctx.fillStyle = "red";
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = "white";
  ctx.fillRect(this.x + 5, this.y, this.width - 10, this.height);
};

// ----------------- //
// == BALL object == //
// ----------------- //
function Ball() {
  this.x = board.width / 2;
  this.y = 160;
  this.radius = 10;
  this.multiplier = 1.5 + board.level * 0.25;
  this.speedX = 2 * this.multiplier;
  this.speedY = 2 * this.multiplier;
  this.speedStatus = true;
  this.speedUp = false;
  ballArray.push(this);
};

Ball.prototype.draw = function () {
  ctx.fillStyle = "#E8E001";
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

// ---------------------- //
//== BALL SHADOW object ==//
// ---------------------- //
function BallShadow(x, y, r) {
  this.x = x;
  this.y = y;
  this.origRadius = r * 0.75;
  this.radius = r * 0.75;
  this.shadowCounter = 0;
  shadowArray.push(this);
};

BallShadow.prototype.draw = function () {
  // decrease radius every 6 frames
  this.decrease = Math.floor(this.shadowCounter / 6);
  if (this.radius - this.decrease <= 0) {
    this.remove();
  } else {
    this.radius = this.origRadius - this.decrease;
    ctx.fillStyle = "rgba(255,255,255, 0.3)"; // transparant white
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    this.shadowCounter++;
  }
};

BallShadow.prototype.remove = function () {
  shadowArray.splice(shadowArray.indexOf(this), 1)
};

// ------------------ //
// == BLOCK boject == //
// ------------------ //
function Block(x, y, health, powerup) {
  this.x = x;
  this.y = y;
  this.width = 50;
  this.height = 15;
  this.health = health;
  this.powerup = powerup;
  blockArray.push(this);
};

Block.prototype.draw = function () {
  ctx.strokeStyle = "white";
  ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
  switch (this.health) {
    case 1: // ctx.fillStyle = "green";
      var my_gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      my_gradient.addColorStop(0, "#0DCC1E");
      my_gradient.addColorStop(1, "green");
      ctx.fillStyle = my_gradient;
      break;
    case 2: ctx.fillStyle = "yellow";
      var my_gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      my_gradient.addColorStop(0, "#CC7D34");
      my_gradient.addColorStop(1, "yellow");
      ctx.fillStyle = my_gradient;
      break;
    case 3: // ctx.fillStyle = my_gradient;
      var my_gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      my_gradient.addColorStop(0, "#FF532A");
      my_gradient.addColorStop(1, "red");
      ctx.fillStyle = my_gradient;
      break;
  }
  ctx.fillRect(this.x, this.y, this.width, this.height);
  // overlay for glass effect
  var glass_gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height / 2);
  glass_gradient.addColorStop(0, "rgba(255,255,255,0.8)");
  glass_gradient.addColorStop(0, "rgba(255,255,255,0.3)");
  ctx.fillStyle = glass_gradient;
  ctx.fillRect(this.x, this.y + 2, this.width - 6, this.height / 2);
};

Block.prototype.explodeBlock = function () {
  // block got hit
  this.health -= 1;
  // if block is broken
  if (this.health == 0) {
    // create smoke animation (explode)
    new Explode(this.x + this.width / 2, this.y + this.height / 2);
    // check powerup
    if (this.powerup) {
      new Powerup(this.x, this.y, this.width, this.height); // give powerup same size as block destroyed
    };
    // remove block from array
    blockArray.splice(blockArray.indexOf(this), 1);
    // check if there are no blocks left (next level)
    if (blockArray.length == 0) {
      board.goNextLevel();
    };
  };
};

// --------------------- //
// == POWER UP boject == //
// --------------------- //
function Powerup(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.speedY = 2;
  this.powerupType = Math.floor(Math.random() * 4 + 1); // 1,2,3,4 
  powerupArray.push(this);
};

Powerup.prototype.move = function () {
  this.y += this.speedY
};

Powerup.prototype.draw = function () {
  ctx.strokeStyle = "white";
  ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
  ctx.fillStyle = "yellow";
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "15px Arial"
  ctx.fillText("!", this.x + this.width / 2, this.y + 13);
};

Powerup.prototype.addRandomPowerUp = function () { 
  switch (this.powerupType) {
    case 1: // increase paddle width (max half of the board)
      paddle.width = Math.min(paddle.width *= 1.5, board.width / 2);
      break;
    case 2: // increase radius ball 
      ballArray.forEach(function (ball) {
        ball.radius *= 1.5;
      });
      break;
    case 3: // extra ball
      new Ball();
      break;
    case 4: // increase speed balls
      ballArray.forEach(function (ball) {
        ball.speedUp = true;
        ball.speedX *= 1.5;
        ball.speedY *= 1.5;
        ball.multiplier *= 1.5;
      });
      break;
  }
};

Powerup.prototype.removeRandomPowerUp = function () {
  switch (this.powerupType) {
    case 1: // dcrease paddle width
      paddle.width *= (2 / 3);
      break;
    case 2: // dcrease radius ball 1 (min 10)
      ballArray.forEach(function (ball) {
        ball.radius = Math.max(ball.radius * (2 / 3), 10);
      });
      break;
    case 3: // ball remains :)
      break;
    case 4: // decrease speed  
      ballArray.forEach(function (ball) {
        if (ball.speedUp == true) {
          ball.speedX *= (2 / 3);
          ball.speedY *= (2 / 3);
          ball.multiplier *= (2 / 3);
          ball.speedUp = false;
        }
      });
      break;
  };
};

// -------------------- //
// == EXPLODE object == //
// -------------------- //
function Explode(x, y) {
  this.x = x;
  this.y = y;
  this.radius = Math.floor(Math.random() * 20 + 10);
  this.r1 = this.radius * Math.random() * 0.5 + 0.5; // 50% - 100% of the original
  this.r2 = this.radius * Math.random() * 0.5 + 0.5;
  this.r3 = this.radius * Math.random() * 0.5 + 0.5;
  this.r4 = this.radius * Math.random() * 0.5 + 0.5;
  this.origRadius = this.radius;
  this.explodeCounter = 0;
  explodeArray.push(this);
};

Explode.prototype.draw = function () {
  this.decrease = Math.floor(this.explodeCounter / 8);
  if (this.radius - this.decrease <= 0) {
    this.remove();
  } else {
    // drawing (4 random circles)
    this.radius = this.origRadius - this.decrease;
    ctx.fillStyle = "grey";
    ctx.beginPath();
    ctx.arc(this.x, this.y - 5, Math.max(this.r1 - this.decrease, 0), 0, Math.PI * 2);
    ctx.moveTo(this.x + 15, this.y);
    ctx.arc(this.x + 15, this.y, Math.max(this.r2 - this.decrease, 0), 0, Math.PI * 2);
    ctx.moveTo(this.x - 15, this.y);
    ctx.arc(this.x - 15, this.y, Math.max(this.r3 - this.decrease, 0), 0, Math.PI * 2);
    ctx.moveTo(this.x, this.y + 5);
    ctx.arc(this.x, this.y + 5, Math.max(this.r4 - this.decrease, 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    // update counter
    this.explodeCounter++;
  }
};

Explode.prototype.remove = function () {
  explodeArray.splice(explodeArray.indexOf(this), 1)
};
