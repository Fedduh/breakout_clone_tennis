"use strict";

// == GLOBAL VAR DECLARATION - START == //
var canvas, ctx; // canvas
var board, paddle, ballArray, blockArray, powerupArray, shadowArray, explodeArray; // assets
// var ball, ball2, score;
var framerate, run, freezegame; // game logic
var goLeft = false; // event listeners
var goRight = false;
// == GLOBAL VAR DECLARATION - END == //


// == SOUNDS - START == //
// paddle bounce
var soundPaddle = new Audio();
soundPaddle.src = "sounds/paddle_bounce.wav";
// soundPaddle.volume = 0.6;
// block hit
var soundBlock1 = new Audio();
soundBlock1.src = "sounds/tennis1.wav";
var soundBlock2 = new Audio();
soundBlock2.src = "sounds/tennis2.wav";
var soundBlock3 = new Audio();
soundBlock3.src = "sounds/tennis3.wav";
var soundBlock4 = new Audio();
soundBlock4.src = "sounds/tennis4.wav";
// next round
var soundWon = new Audio();
soundWon.src = "sounds/applaud.wav";
// out
var soundOut = new Audio(); 
soundOut.src = "sounds/tennis_out.wav";
// == SOUNDS - END == //


// == DOM READY - START == //
$("document").ready(function () {
  // => Canvas
  canvas = document.getElementById("canvasBoard");
  ctx = document.getElementById("canvasBoard").getContext("2d");

  // => Start game trigger
  $("#startButton").on("click", function (e) {
    startGame();
  });

  // => Demo start trigger
  $("#startDemo").on("click", function (e) {
    startGame();
    setInterval(function() {
      paddle.width = board.width - 20;
      paddle.x = 10;
    }, 200) // paddle powerdown decreases size by 50%, so interval
  });

  // => show tennis field
  setupGame();

  // => Key events - smooth moving (no delay)  
  addEventListener("keydown", function (e) {
    if (e.key == "ArrowLeft") { goLeft = true };
  });
  addEventListener("keyup", function (e) {
    if (e.key == "ArrowLeft") { goLeft = false };
  });
  addEventListener("keydown", function (e) {
    if (e.key == "ArrowRight") { goRight = true };
  });
  addEventListener("keyup", function (e) {
    if (e.key == "ArrowRight") { goRight = false };
  });
});
// == DOM READY - END == //


// == BEGIN GAME - START == //
function startGame() {
  setupGame();
  setTimeout(() => {
    ballArray = [];
    new Ball();
  }, 1000);
  requestAnimationFrame(updateCanvas);
};

function setupGame() {
  cancelAnimationFrame(run); // stop current updateAnimationFrame (if a game was already active) 
  framerate = 0; // update global var 
  freezegame = false;
  // score = 0;
  board = new Board(); // update global var 
  board.draw();
  paddle = new Paddle(); // update global var
  ballArray = [];
  shadowArray = [];
  powerupArray = [];
  explodeArray = [];
  board.createBlocks();
  board.drawScore();
  board.drawLives();
  board.drawLevels();
};
// == BEGIN GAME - END == //


//-----------------------------//
// == UPDATE CANVAS - START == //
function updateCanvas() {
  framerate++;
  // => clear  
  board.draw();
  // => paddle
  paddle.move();
  paddle.draw();
  // => blocks
  blockArray.forEach(function (block) {
    block.draw();
  });
  // => powerup(s)
  powerupArray.forEach(function (powerup) {
    powerup.move();
    powerup.draw();
  });
  // => Shadow(s)
  shadowArray.forEach(function (shadow) {
    shadow.draw();
  });
  // => Explosions
  explodeArray.forEach(function (explode) {
    explode.draw();
  });
  // => COLLISION
  // balls collission
  ballArray.forEach(function (ball) {
    // hitting right border
    if (ball.x + ball.radius > board.width) {
      ball.x = board.width - 1 - ball.radius;
      ball.speedX *= -1
    };
    // hitting left border
    if (ball.x - ball.radius < board.x) {
      ball.x = board.x + 1 + ball.radius;
      ball.speedX *= -1
    };
    // hitting top  border
    if (ball.y - ball.radius <= board.y) {
      ball.y = board.y + 1 + ball.radius;
      ball.speedY *= -1
    };
    // hitting bottom (remove ball / game over)
    if (ball.y - ball.radius >= board.height) {
      // ball.speedY *= -1 // testing
      ballArray.splice(ballArray.indexOf(ball), 1);
      board.gameOver();
    };
    // hitting paddle
    if (ball.y + ball.radius >= paddle.y
      && ball.y + ball.radius <= paddle.y + paddle.height
      && ball.x - ball.radius >= paddle.x - (ball.radius * 2)
      && ball.x + ball.radius <= paddle.x + paddle.width + (ball.radius * 2)
    ) {
      // little bounce effect
      paddle.y += 5;
      setTimeout(function () {
        paddle.y -= 5;
      }, 100);
      audioPlay(soundPaddle);
      // Variables for setting the paddle physics
      var paddleMidX = paddle.x + paddle.width / 2;
      var diffPaddleBall = Math.abs(paddleMidX - ball.x);
      var diffPercent = diffPaddleBall / (paddle.width / 2);
      // Determine physics for paddle
      // right hit
      if (ball.x > paddle.x + (paddle.width / 2)) {
        ball.speedX = (0.2 + (diffPercent * 2.2)) * ball.multiplier;
      } else {
        // left hit
        ball.speedX = -0.2 - (diffPercent * 2.2) * ball.multiplier;
      };
      ball.speedY = (-4 + (diffPercent * 2.2)) * ball.multiplier;
    };

    // => hitting blocks
    blockArray.forEach(function (block) {
      if (rectCircleColliding(ball, block) && ball.speedStatus == true) {
        randomSoundHit();
        block.explodeBlock();
        board.score++;
        board.drawScore();
        if (ball.x - ball.radius >= block.x + block.width - 5 || ball.x + ball.radius <= block.x + 5) {
          ball.speedX *= -1; //hit from left/right 
        } else {
          ball.speedY *= -1; //hit from top/bottom 
        };
        // speedStatus is needed for when ball hits a block on a corner. Otherwise it will trigger many speedX *= -1 events
        ball.speedStatus = false;
        setTimeout(function () {
          ball.speedStatus = true;
        }, 20);
      };
    }); // end of block loop

    // => hitting powerups
    powerupArray.forEach(function (powerup) {
      if (powerup.y + powerup.height >= paddle.y
        && powerup.y + powerup.height <= paddle.y + paddle.height + powerup.height
        && powerup.x >= paddle.x - powerup.width
        && powerup.x + powerup.width <= paddle.x + paddle.width + powerup.width
      ) {
        powerupArray.splice(powerupArray.indexOf(powerup), 1);
        // paddle.width = Math.min(paddle.width *= 1.5, board.width / 2);
        powerup.addRandomPowerUp();
        // clear this powerup after 10 sec and when balls are at top half (condition checked every 200 ms)
        setTimeout(function () {
          var interval = setInterval(function () {
            if (getMaxY() < board.height) {
              powerup.removeRandomPowerUp();
              clearInterval(interval);
            };
          }, 200);
        }, 10000);
      };
    });

    // => move ball(s) + shadows - still in ballArray loop   
    new BallShadow(ball.x, ball.y, ball.radius);
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    ball.draw();
  });

  if (!freezegame) {
    run = requestAnimationFrame(updateCanvas);
  }
};
// == UPDATE CANVAS - END == //
//---------------------------//


// == FUNCTIONS - START == //
// => Max Y of ballArray. If Y > max then y else max. Start at max = 0
function getMaxY() {
  return ballArray.reduce((max, ball) => ball.y > max ? ball.y : max, 0);
};

// => return true if the rectangle and circle are colliding
function rectCircleColliding(ball, block) {
  // calc distance between center ball and center block
  var distX = Math.abs(ball.x - block.x - block.width / 2);
  var distY = Math.abs(ball.y - block.y - block.height / 2);
  // determine how close they are
  if (distX > (block.width / 2 + ball.radius)) { return false; }
  if (distY > (block.height / 2 + ball.radius)) { return false; }
  // check collision
  if (distX <= (block.width / 2)) { return true; }
  if (distY <= (block.height / 2)) { return true; }
  // check collision on corners
  var dx = distX - block.width / 2;
  var dy = distY - block.height / 2;
  return (dx * dx + dy * dy <= (ball.radius * ball.radius));
};

// => Sounds. Clone and play (allows overlapping sound effects)
function audioPlay(audioName) {
  // the true parameter will tell the function to make a deep clone (cloning attributes as well) 
  var clone = audioName.cloneNode(true);
  clone.play();
};

function randomSoundHit() {
  var randomNr = Math.floor(Math.random() * 4 + 1);
  switch (randomNr) {
    case 1:
      audioPlay(soundBlock1);
      break;
    case 2:
      audioPlay(soundBlock2);
      break;
    case 3:
      audioPlay(soundBlock3);
      break;
    case 4:
      audioPlay(soundBlock4);
      break;
  };
};