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