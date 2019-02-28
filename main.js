"use strict";

// global variables
var paddle, board, ballArray, ball, framerate;
var goLeft = false;
var goRight = false;

$("document").ready(function () {

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
    this.width = 75;
    this.height = 15;
    this.x = board.width / 2 - (this.width / 2);
    this.y = 480;
    this.speed = 5;
    this.draw = function () {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  };

  // Ball constructor
  function Ball() {
    this.x = board.width / 2;
    this.y = 200;
    this.radius = 15;
    this.speedX = -2;
    this.speedY = 2;
    this.draw = function () {
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    ballArray.push(this);
  };

  function Block(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 15;
    this.draw = function () {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

  };

  var blockArray = [];

  function createBlocks() {
    for (var j = 1; j < 5; j++) { // 4 high
      var x = 30;
      for (var i = 0; i < 7; i++) { // 7 wide
        var block = new Block(x, 25 * j);
        blockArray.push(block);
        x = x + 50;
      }
    }
  };

  createBlocks();

  // function testBlock() {
  //   var block = new Block(50, 50);
  //   blockArray.push(block);
  // }
  // testBlock();


  console.table(blockArray);


  // -----------
  // Start game
  function startGame() {
    board = new Board(); // update global var 
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, board.width, board.height);
    paddle = new Paddle(); // update global var
    ball = new Ball(); // update global var 
    framerate = 0; // update global var
    console.table(ballArray);
    requestAnimationFrame(updateCanvas)
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
      // hitting left / right
      if (ball.x + ball.radius >= board.width || ball.x - ball.radius <= board.x) { ball.speedX *= -1 };
      // hitting top 
      if (ball.y - ball.radius <= board.y) { ball.speedY *= -1 };
      // hitting paddle
      if (ball.y + ball.radius >= paddle.y
        && ball.y + ball.radius <= paddle.y + 5 //paddle.height
        && ball.x - ball.radius >= paddle.x - (ball.radius * 2)
        && ball.x + ball.radius <= paddle.x + paddle.width + (ball.radius * 2)
      ) {
        ball.speedY *= -1;
        // ball.speedY *= -1 * (((ball.x - paddle.x) / paddle.width) * 0.2 + 0.25)
      };
      // hitting blocks
      blockArray.forEach(function (block) {
        // colisson from below
        if (ball.y + ball.radius >= block.y
          && ball.y - ball.radius <= block.y + block.height
          && ball.x - ball.radius >= block.x - (ball.radius * 2)
          && ball.x + ball.radius <= (block.x + block.width + (ball.radius * 2))
        ) {
          // shatter block 
          console.log("boom"); 
          ball.speedY *= -1;
          ball.speedX *= -1;
        }
      });
      // move ball
      ball.x += ball.speedX;
      ball.y += ball.speedY;
      ball.draw();
    });

    requestAnimationFrame(updateCanvas);
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

  function move() {
    // console.log("left is " + goLeft + "/ right is " + goRight);
    if (goLeft) { paddle.x = (paddle.x <= 5 ? 5 : paddle.x - paddle.speed) };
    if (goRight) { paddle.x = (paddle.x + paddle.width >= board.width - 5 ? board.width - 5 - paddle.width : paddle.x + paddle.speed) };
  };



});