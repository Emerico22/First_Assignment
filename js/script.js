
let barWidth = 0;
let canvas, ctx, w, h; 
let mousePos;
let initialSpeed = 1;
let Score = 0

let gameStates = {
  mainMenu: 0,
  gameRunning: 1,
  gameOver: 2,
}

let currentGameState = gameStates.gameRunning
let currentLevel = 1
let balls = []; 
let initialNumberOfBalls;
let globalSpeedMutiplier = 1;
let colorToEat = 'red';
let wrongBallsEaten = goodBallsEaten = 0;
let numberOfGoodBalls;

let player = {
  x:10,
  y:10,
  width:20,
  height:20,
  color:'red'
}

window.onload = function init() {
    canvas = document.querySelector("#myCanvas");
  
    w = canvas.width; 
    h = canvas.height;  
  
    ctx = canvas.getContext('2d');
  
    startGame(10);
  
    canvas.addEventListener('mousemove', mouseMoved);

    mainLoop();
};

document.addEventListener('keydown', function (event) {
  if (event.key === 'Shift') {
    increaseBar();
  }
});

document.addEventListener('keyup', function (event) {
  if (event.key === 'Shift') {
    decreaseBar();
  }
});

function increaseBar() {
  const innerBar = document.getElementById('innerBar');
  if (barWidth < 100) {barWidth += 3; 
    innerBar.style.width = barWidth + '%';
    console.log(barWidth);
    globalSpeedMutiplier = 0.2;
    requestAnimationFrame(increaseBar)
  } 
  else {globalSpeedMutiplier = initialSpeed;}
}


function decreaseBar() {const innerBar = document.getElementById('innerBar');
if (barWidth > 0) { barWidth -= 1;
    innerBar.style.width = barWidth + '%';
    console.log(barWidth);
    globalSpeedMutiplier = initialSpeed
    requestAnimationFrame(decreaseBar);
   
  }
}
function startGame(nb) {
  do {
    balls = createBalls(nb);
    initialNumberOfBalls = nb;
    numberOfGoodBalls = countNumberOfGoodBalls(balls, colorToEat);
  } while(numberOfGoodBalls === 0);
  
  wrongBallsEaten = goodBallsEaten = 0;
  currentGameState = gameStates.gameRunning;
  barwidth = 0;
}

function countNumberOfGoodBalls(balls, colorToEat) {
  var nb = 0;
  
  balls.forEach(function(b) {
    if(b.color === colorToEat)
      nb++;
  });
  
  return nb;
}

function goToNextLevel() {
  currentLevel++;
  Score+= (initialNumberOfBalls - wrongBallsEaten)
  console.log(currentLevel)
  startGame(initialNumberOfBalls+1)
}


function changeColorToEat(color) {
  colorToEat = color;
}

function changePlayerColor(color) {
  player.color = color;
}

function changeBallSpeed(coef) {
    globalSpeedMutiplier = coef;
    initialSpeed = coef;
}

function mouseMoved(evt) {
    mousePos = getMousePos(canvas, evt);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function movePlayerWithMouse() {
  if(mousePos !== undefined) {
    player.x = mousePos.x;
    player.y = mousePos.y;
  }
}

function mainLoop() {
  ctx.clearRect(0, 0, w, h);
  if (numberOfGoodBalls === goodBallsEaten) {
    console.log("Win");
    goToNextLevel();
    
  } else if (wrongBallsEaten === 3) {
    currentGameState = gameStates.gameOver
  }
  switch (currentGameState) {
    case gameStates.gameRunning:
  drawFilledRectangle(player);
  drawAllBalls(balls);
  drawBallNumbers(balls);

  moveAllBalls(balls);
  movePlayerWithMouse();
  ctx.font="20px Arial";
  ctx.fillText("Level : " + currentLevel, 800, 20);
  ctx.fillText("Slow the balls (shift)", 100, 20);
  ctx.fillText("Wrong Balls eaten: " + wrongBallsEaten, 410, 20);
  ctx.fillText("Score : " + (Score), 
                 650, 20);
 break;
  

  case gameStates.mainMenu:

  break;
  case gameStates.gameOver:
    ctx.clearRect(0, 0, w, h);
    ctx.font="30px Arial";
  ctx.fillText("GAME OVER", 350, 100);
    ctx.fillText("Press SPACE to restart", 300, 150);
    ctx.fillText("Your final Score : " + (Score), 
                 320, 200);
    window.addEventListener('keydown', function(event) {
      if (event.keyCode === 32) {startGame(10);
        currentLevel = 1;
        Score = 0;
  }})
  break;
}
   
  requestAnimationFrame(mainLoop);
 
}

function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
   var testX=cx;
   var testY=cy;
   if (testX < x0) testX=x0;
   if (testX > (x0+w0)) testX=(x0+w0);
   if (testY < y0) testY=y0;
   if (testY > (y0+h0)) testY=(y0+h0);
   return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))< r*r);
}

function createBalls(n) {

  let ballArray = [];
  
  for(var i=0; i < n; i++) {
     var b = {
        x:w/2,
        y:h/2,
        radius: 5 + 30 * Math.random(),
        speedX: -5 + 10 * Math.random(),
        speedY: -5 + 10 * Math.random(),
        color:getARandomColor(),
      }
     
     ballArray.push(b);
    }

  return ballArray;
}

function getARandomColor() {
  var colors = ['red', 'blue', 'cyan', 'purple', 'pink', 'green', 'yellow'];
  
  var colorIndex = Math.round((colors.length-1)*Math.random()); 
  var c = colors[colorIndex];
  
  return c;
}

function drawBallNumbers(balls) { 
  ctx.save();
  ctx.font="20px Arial";
  ctx.restore();
}

function drawAllBalls(ballArray) {
    ballArray.forEach((b) => {
      drawFilledCircle(b);
    });
}

function moveAllBalls(ballArray) {
  
  balls.forEach(function(b, index) {
     
      b.x += (b.speedX * globalSpeedMutiplier);
      b.y += (b.speedY * globalSpeedMutiplier);
  
      testCollisionBallWithWalls(b); 
    
      testCollisionWithPlayer(b, index);
  });
}

function testCollisionWithPlayer(b, index) {
  if(circRectsOverlap(player.x, player.y,
                     player.width, player.height,
                     b.x, b.y, b.radius)) {
    
    if(b.color === colorToEat) {
     
      goodBallsEaten += 1;
    } else {
      wrongBallsEaten += 1;
    }
    
    balls.splice(index, 1);

  }
}

function testCollisionBallWithWalls(b) {
   
    if((b.x + b.radius) > w) {
    
    b.speedX = -b.speedX;
    
    b.x = w - b.radius;
  } else if((b.x -b.radius) < 0) {
    
    b.speedX = -b.speedX;
    
    
    b.x = b.radius;
  }
  
  if((b.y + b.radius) > h) {
  
    b.speedY = -b.speedY;
    
    
    b.y = h - b.radius;
  } else if((b.y -b.radius) < 0) {
    
    b.speedY = -b.speedY;
    
    b.Y = b.radius;
  }  
}

function drawFilledRectangle(r) {
    
    ctx.save();
  
    ctx.translate(r.x, r.y);
  
    ctx.fillStyle = r.color;
   
    ctx.fillRect(0, 0, r.width, r.height);
  
    ctx.restore();
}

function drawFilledCircle(c) {
   
    ctx.save();
  
    ctx.translate(c.x, c.y);
  
    ctx.fillStyle = c.color;
    
    ctx.beginPath();
    ctx.arc(0, 0, c.radius, 0, 2*Math.PI);
    ctx.fill();
 
    ctx.restore();
}