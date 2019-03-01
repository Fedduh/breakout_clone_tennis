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
      ctx.fillStyle = "grey";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x + 5, this.y + 1, this.width - 10, this.height - 2);
    }
  };

  // Ball constructor
  function Ball() {
    this.x = board.width / 2;
    this.y = 160;
    this.radius = 10;
    this.speedX = -2;
    this.speedY = 2;
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
    this.width = 40; // 40
    this.height = 15; // 15
    this.health = health;
    this.draw = function () {
      ctx.strokeRect(this.x-1, this.y-1, this.width + 2, this.height + 2);
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
    }
  };

  var blockArray = [];

  function createBlocks() {
    for (var j = 1; j < 5; j++) { // 4 high
      var x = 30;
      for (var i = 0; i < 7; i++) { // 7 wide
        var health = Math.floor(Math.random() * 3 + 1); // 1, 2, 3
        var block = new Block(x, 25 * j, health);
        blockArray.push(block);
        x = x + 50;
      }
    }
  };

  createBlocks();

  // function testBlock() {
  //   var block = new Block(150, 150);
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
      // hitting left / right border
      if (ball.x + ball.radius >= board.width || ball.x - ball.radius <= board.x) { ball.speedX *= -1 };
      // hitting top  border
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
        if (RectCircleColliding(ball, block) && ball.speedStatus == true) {
          explodeBlock(block);
          if (ball.x - ball.radius >= block.x + block.width - 5 || ball.x + ball.radius <= block.x + 5) {
            ball.speedX *= -1; //hit detected on left/right...change left/right direction
            console.log("hit left / right");
          } else {
            ball.speedY *= -1; //hit detected on top/bottom...change top/bottom direction
            console.log("hit top / bottom");
          };
          // speedStatus is needed for when ball hits a block on a corner. Otherwise it will trigger many speedX *= -1 events
          ball.speedStatus = false;
          setTimeout(function () {
            ball.speedStatus = true;
            console.log("reset")
          }, 20);
        }

      });

    });
    // move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    ball.draw();


    requestAnimationFrame(updateCanvas);
  };

  // COLLISION
  // return true if the rectangle and circle are colliding
  function RectCircleColliding(ball, block) {
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
    console.table(block);
    block.health -= 1;
    console.table(block);
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