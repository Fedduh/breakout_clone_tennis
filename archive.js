  // Key events
  addEventListener("keydown",function(e) {
    switch(e.key) {
      case "ArrowLeft": 
      paddle.x = (paddle.x = (paddle.x <= 5 ? 5 : paddle.x - paddle.speed));
      break;
    case "ArrowRight": 
      paddle.x = (paddle.x + paddle.width >= 495 ? 495 - paddle.width : paddle.x + paddle.speed); 
      break;
    };
  });

  /////////////////// old collission block

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

  // collission
  https://stackoverflow.com/questions/47265857/rectangle-and-circle-resolve-collision

  https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle

  // border around rectangle
  http://jsfiddle.net/robhawkes/gHCJt/


  var diff = Math.abs(ball.x - (paddle.x + paddle.width / 2));
  var paddleXx = (paddle.x + paddle.width / 2);
// console.log(ball.x);
// console.log(paddle.x + paddle.width / 2);
console.log(diff);
if (ball.x > paddle.x + (paddle.width / 2)) { // right
var test = (paddleXx - ball.x);
console.log("test x ball - paddle mid = " + test);
var test2 = test / (paddle.width / 2);
console.log("test2 = " + test2);
ball.speedX = 2 * ball.multiplier;
ball.speedY = -2 * ball.multiplier
} else { //left 
ball.speedX = -2 * ball.multiplier;
ball.speedY = -2 * ball.multiplier;