"use strict";

// global variables
var paddle, board, ballArray, ball, ball2, blockArray, framerate, score, run, gameover;
var goLeft = false;
var goRight = false;
// var audio = new Audio();
// audio.src = "sounds/108934__soundcollectah__bottle-ping.aiff";




$("document").ready(function () {

  // function Sound(src) {
  //   this.sound = document.createElement("audio");
  //   this.sound.src = src;
  //   this.sound.setAttribute("preload", "auto");
  //   this.sound.setAttribute("controls", "none");
  //   this.sound.style.display = "none";
  //   document.body.appendChild(this.sound);
  //   this.crossOrigin="anonymous"
  //   this.play = function(){
  //     this.sound.play();
  //   }
  //   this.stop = function(){
  //     this.sound.pause();
  //   }
  // };
  
  // var soundPaddle = new Sound("sounds/108934__soundcollectah__bottle-ping.aiff");
  // console.log(soundPaddle);
  // ---------------
  // Assets 
  var canvas = document.getElementById("canvasBoard");
  var ctx = document.getElementById("canvasBoard").getContext("2d");
  var ballArray = [];


  // Board constructor
  function Board() {
    this.x = 0;
    this.y = 0;
    this.width = 400;
    this.height = 500;
    // make canvas size equal to board
    canvas.width = this.width;
    canvas.height = this.height;
  };

  // Paddle constructor
  function Paddle() {
    this.width = 100; //75
    this.height = 15;
    this.x = board.width / 2 - (this.width / 2);
    this.y = 480;
    this.speed = 5;
    this.draw = function () {
      ctx.fillStyle = "grey";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "black";
      ctx.fillRect(this.x + 5, this.y + 1, this.width - 10, this.height - 2);
    }
  };

  // Ball constructor
  function Ball(speedX, speedY) {
    this.x = board.width / 2;
    this.y = 160;
    this.radius = 10;
    this.multiplier = 1.5;
    this.speedX = speedX * this.multiplier;
    this.speedY = speedY * this.multiplier;
    this.speedStatus = true;
    this.draw = function () {
      ctx.fillStyle = "grey";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    ballArray.push(this);
  };

  
  function Block(x, y, health) {
    this.x = x;
    this.y = y;
    this.width = 50; // 40
    this.height = 15; // 15
    this.health = health;
    this.draw = function () {
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
    }
    blockArray.push(this);
  };


  function createBlocks() {
    blockArray = [];
    for (var j = 1; j < 6; j++) { // 4 high
      var x = 30;
      for (var i = 0; i < 6; i++) { // 6 wide
        var health = Math.floor(Math.random() * 4); // 1, 2, 3
        if(health > 0) {
        new Block(x, 25 * j, health);
        }
        // blockArray.push(block);
        x = x + 60;
      }
    }
  };



  // function testBlock() {
  //   var block = new Block(150, 150);
  //   blockArray.push(block);
  // }
  // testBlock();


  console.table(blockArray);


  // -----------
  // Start game
  function startGame() {
    cancelAnimationFrame(run); // stop current updateAnimationFrame (if a game was already active) 
    gameover = false;
    board = new Board(); // update global var 
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, board.width, board.height);
    score = 0;
    drawScore();
    paddle = new Paddle(); // update global var
    ballArray = [];
    ball = new Ball(2, 2); // update global var 
    ball2 = new Ball(1, 3); // update global var 
    createBlocks();
    framerate = 0; // update global var 
    requestAnimationFrame(updateCanvas);
  };

  // ------------------
  // Drawing the board
  function updateCanvas() {
    framerate++;
    // clear canvas    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, board.width, board.height);
    // paddle movement + drawing
    move();
    paddle.draw();
    // blocks
    blockArray.forEach(function (block) {
      block.draw();
    })

    // balls collission
    ballArray.forEach(function (ball) {
      // hitting left / right border
      if (ball.x + ball.radius > board.width || ball.x - ball.radius < board.x) { ball.speedX *= -1 };
      // hitting top  border
      if (ball.y - ball.radius <= board.y) { ball.speedY *= -1 };
      // hitting bottom (remove ball / game over)
      if (ball.y - ball.radius >= board.height) {
        ballArray.splice(ballArray.indexOf(ball), 1); 
        gameOver();
      };
      // hitting paddle
      if (ball.y + ball.radius >= paddle.y
        && ball.y + ball.radius <= paddle.y + 5 //paddle.height
        && ball.x - ball.radius >= paddle.x - (ball.radius * 2)
        && ball.x + ball.radius <= paddle.x + paddle.width + (ball.radius * 2)
      ) {
        // soundPaddle.play();
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

      // hitting blocks
      blockArray.forEach(function (block) {
        if (rectCircleColliding(ball, block) && ball.speedStatus == true) {
          explodeBlock(block);
          score++;
          drawScore();
          if (ball.x - ball.radius >= block.x + block.width - 5 || ball.x + ball.radius <= block.x + 5) {
            ball.speedX *= -1; //hit from left/right
            // console.log("hit left / right");
          } else {
            ball.speedY *= -1; //hit from top/bottom
            // console.log("hit top / bottom");
          };
          // speedStatus is needed for when ball hits a block on a corner. Otherwise it will trigger many speedX *= -1 events
          ball.speedStatus = false;
          setTimeout(function () {
            ball.speedStatus = true;
            console.log("reset")
          }, 40);
        }

      });

      // move ball
      ball.x += ball.speedX;
      ball.y += ball.speedY;
      ball.draw();
    });

    if (!gameover) {
      run = requestAnimationFrame(updateCanvas);
    }
  };

  // COLLISION
  // return true if the rectangle and circle are colliding
  function rectCircleColliding(ball, block) {
    var distX = Math.abs(ball.x - block.x - block.width / 2);
    var distY = Math.abs(ball.y - block.y - block.height / 2);

    if (distX > (block.width / 2 + ball.radius)) { return false; }
    if (distY > (block.height / 2 + ball.radius)) { return false; }

    if (distX <= (block.width / 2)) { return true; }
    if (distY <= (block.height / 2)) { return true; }

    var dx = distX - block.width / 2;
    var dy = distY - block.height / 2;
    return (dx * dx + dy * dy <= (ball.radius * ball.radius));

  };

  // ----------------------
  // Explode block when hit
  function explodeBlock(block) {
    // console.table(block);
    block.health -= 1;
    // console.table(block);
    if (block.health == 0) {
      blockArray.splice(blockArray.indexOf(block), 1);
      // animate explosion confetti
      confetti(block.x + block.width / 2, block.y + block.height / 2);
    };
  }

  // ------------------
  // Confetti animation
  function confetti(blockX, blockY) {
    //
  }

  // -----------
  // Score
  function drawScore() {
    $("#points").text(score);
  };

  // ---------------
  // Check game over
  function gameOver() {
    if (ballArray.length == 0) { 
      gameover = true; 
      ctx.fillStyle = "white";
      ctx.fillRect(50, 50, board.width - 100, board.height - 100);
      ctx.fillStyle = "black";
      ctx.font = "30px Arial"
      ctx.textAlign = "center";
      ctx.fillText("Game Over", board.width / 2, board.height / 2);
      ctx.fillText("Score : " + score, board.width / 2, board.height / 2 + 50);
    }
  };

  // -----------------
  // Start game trigger
  $("#startButton").on("click", function (e) {
    startGame();
  });

  // -------------------------------------
  // Key events - smooth moving (no delay)

  // LEFT
  addEventListener("keydown", function (e) {
    if (e.key == "ArrowLeft") { goLeft = true };
  });
  addEventListener("keyup", function (e) {
    if (e.key == "ArrowLeft") { goLeft = false };
  });
  // RIGHT
  addEventListener("keydown", function (e) {
    if (e.key == "ArrowRight") { goRight = true };
  });
  addEventListener("keyup", function (e) {
    if (e.key == "ArrowRight") { goRight = false };
  });

  function move() { // change to paddle prototype?? // <--------------------------------
    // console.log("left is " + goLeft + "/ right is " + goRight);
    if (goLeft) { paddle.x = (paddle.x <= 5 ? 5 : paddle.x - paddle.speed) };
    if (goRight) { paddle.x = (paddle.x + paddle.width >= board.width - 5 ? board.width - 5 - paddle.width : paddle.x + paddle.speed) };
  };

});