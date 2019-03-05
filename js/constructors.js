"use strict";

// == BOARD == //
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

Board.prototype.createBlocks = function () {
  blockArray = [];
  for (var j = 1; j < 6; j++) { // 5 high (5)
    var x = 30;
    for (var i = 1; i < 7; i++) { // 6 wide (7)
      var health = Math.floor(Math.random() * 4); // 0, 1, 2, 3 (4)
      // 20% of block containing powerup
      var powerup = (Math.random() < 0.2 ? true : false);
      if (health > 0) {
        new Block(x, 25 * j, health, powerup);
      }
      x = x + 60;
    }
  }
};

Board.prototype.drawScore = function () {
  $("#points").text(this.score);
};

Board.prototype.drawlives = function () {
  var hearts = '';
  for (var i = 1; i <= this.lives; i++) {
    hearts += "\u2665"; //unicode heart; 
  };
  $("#lives").text(hearts)
};

Board.prototype.drawLevels = function () {
  $("#levels").text(this.level);
};

Board.prototype.gameOver = function () {
  if (ballArray.length == 0) {
    this.lives--;
    this.drawlives();
    // create new ball
    setTimeout(function () {
      new Ball();
    }, 500);
  };
  if (board.lives == 0) {
    freezegame = true;
    ctx.fillStyle = "white";
    ctx.fillRect(50, 50, board.width - 100, board.height - 100);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", board.width / 2, board.height / 2);
    ctx.fillText("Score : " + board.score, board.width / 2, board.height / 2 + 50);
  };
};

Board.prototype.goNextLevel = function () {
  ballArray = [];
  powerupArray = [];
  this.level++;
  this.drawLevels();
  board.createBlocks();
  setTimeout(function () {
    new Ball();
  }, 2000);
};

// == PADDLE == //
function Paddle() {
  this.width = 80; //75
  this.height = 15;
  this.x = board.width / 2 - (this.width / 2);
  this.y = 480;
  this.speed = 5;
  this.draw = function () {
    ctx.fillStyle = "grey";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x + 5, this.y + 1, this.width - 10, this.height - 2);
  };
  this.move = function () {
    if (goLeft) { this.x = (this.x <= 5 ? 5 : this.x - this.speed) };
    if (goRight) { this.x = (this.x + this.width >= board.width - 5 ? board.width - 5 - this.width : this.x + this.speed) };
  };
};

// == BALL == //
function Ball() {
  this.x = board.width / 2;
  this.y = 160;
  this.radius = 10;
  this.multiplier = 1.25 + board.level * 0.25;
  this.speedX = 2 * this.multiplier;
  this.speedY = 2 * this.multiplier;
  this.speedStatus = true;
  this.draw = function () {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  };
  ballArray.push(this);
};

var shadowArray = [];

function BallShadow(x, y, r) {
  this.x = x;
  this.y = y;
  this.origRadius = r * 0.75;
  this.radius = r * 0.75;
  this.shadowCounter = 0;
  // this.decrease = 1;
  this.draw = function () { 
    this.decrease = Math.floor(this.shadowCounter / 6);
    if (this.radius - this.decrease <= 0) {
      this.remove();
    } else {
      this.radius = this.origRadius - this.decrease; 
      ctx.fillStyle = "rgba(54, 219, 248, 0.3)"; 
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      this.shadowCounter++;
    }
  };
  this.remove = function () { shadowArray.splice(shadowArray.indexOf(this), 1) };
  shadowArray.push(this);
}

// == BLOCK == //
function Block(x, y, health, powerup) {
  this.x = x;
  this.y = y;
  this.width = 50; // 40
  this.height = 15; // 15
  this.health = health;
  this.powerup = powerup;
  blockArray.push(this);
};

Block.prototype.draw = function () {
  ctx.strokeRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
  switch (this.health) {
    case 1: ctx.fillStyle = "green";
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
  glass_gradient.addColorStop(0, "rgba(255,255,255,0.7)");
  glass_gradient.addColorStop(0, "rgba(255,255,255,0.2)");
  ctx.fillStyle = glass_gradient;
  ctx.fillRect(this.x, this.y + 2, this.width - 6, this.height / 2);
};

Block.prototype.explodeBlock = function () {
  this.health -= 1;
  if (this.health == 0) {
    // animate explosion confetti
    confetti(this.x + this.width / 2, this.y + this.height / 2);
    // check powerup
    if (this.powerup) {
      console.log("power up!!!!")
      new Powerup(this.x, this.y, this.width, this.height); // give powerup same size as block destroyed
    } else {
      console.log("no power up")
    }
    // remove block from array
    blockArray.splice(blockArray.indexOf(this), 1);
    // check if there are no blocks left (next level)
    if (blockArray.length == 0) {
      board.goNextLevel();
    }
  };
};

// == POWER UP == //
function Powerup(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.speedY = 2;
  this.powerupType = Math.floor(Math.random() * 4 + 1); // 1,2,3,4
  this.move = function () { this.y += this.speedY };
  this.draw = function () {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "15px Arial"
    ctx.fillText("?", this.x + this.width / 2, this.y + 13);
  };
  powerupArray.push(this);
};

Powerup.prototype.addRandomPowerUp = function () {
  console.log(this.powerupType);
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
        ball.speedX *= (2 / 3);
        ball.speedY *= (2 / 3);
        ball.multiplier *= (2 / 3)
      });
      break;
  }
};