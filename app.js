const noAsteroids = 5;

var startTime;
var gameTime;

var myGamePiece;
var asteroids = [];
var keys = [];
var gameEnded = false;

localStorage.setItem('bestScore', 0);

// Event listener for keydown events
window.addEventListener("keydown", function (e) {
  // Check if Enter key is pressed and game has ended
  if (e.keyCode === 13 && gameEnded) {
    gameEnded = false;
    startGame();
  } else {
    keys[e.keyCode] = true;
  }
});

// Event listener for keyup events
window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

// Function to generate a random grey color
function getRandomGrey() {
  let greyShade = Math.floor(Math.random() * (240 - 30 + 1)) + 30
  return 'rgb(' + greyShade + ',' + greyShade + ',' + greyShade + ')';
}

// Function to get a random position within the canvas
function getRandomPosition(max_pos) {
  let pos = Math.floor(Math.random() * max_pos);
  // Ensure that asteroids are outside canvas at first
  if(pos >= max_pos/2) 
    pos -= max_pos;
  else if(pos < max_pos/2)
    pos += max_pos;
  return pos; 
}

// Function to get a random speed between -5 and 5
function getRandomSpeed() {
  return  Math.floor((Math.random() - 0.5) * 10);
}

// Function to generate n asteroids
function generateAsteroids(n) {
  for (var i = 0; i < n; i++) {
    asteroids.push(new component(30, 30, getRandomGrey(), getRandomPosition(window.innerWidth), getRandomPosition(window.innerHeight), "asteroid", getRandomSpeed(), getRandomSpeed()));
  }
}

// Function to format time in minutes:seconds.milliseconds
function formatTime(milliseconds) {
  let min = Math.floor(milliseconds / (60 * 1000)).toString().padStart(2, '0');
  let sec = Math.floor((milliseconds % (60 * 1000)) / 1000).toString().padStart(2, '0');
  let ms= (milliseconds % 1000).toString().padStart(3, '0');

  return `${min}:${sec}.${ms}`;
}

// Function to start the game
function startGame() {
  myGamePiece = new component(40, 40, "red", window.innerWidth/2, window.innerHeight/2, "main", 0, 0);
  generateAsteroids(noAsteroids);
  startTime = new Date();
  myGameArea.start();
}

var myGameArea = {
  canvas : document.createElement("canvas"),
  // Method to start the game area
  start : function() {
    this.canvas.id = "myGameCanvas";
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    // Update game elements every 20 miliseconds
    this.interval = setInterval(updateGameArea, 20);
    // Generate two asteroids every 15 seconds
    this.generateAsteroidInterval = setInterval(function() {
      generateAsteroids(2);
    }, 15000);
  },
  // Method to stop the game 
  stop : function() {
    clearInterval(this.interval);
    clearInterval(this.generateAsteroidInterval);
    this.clear()
    asteroids = [];
  },
  // Method to clear the canvas
  clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Component constructor function for game pieces
function component(width, height, color, x, y, type, sx, sy) {
  this.type = type;
  this.width = width;
  this.height = height;
  this.speed_x = sx;
  this.speed_y = sy;
  this.x = x;
  this.y = y;
  // Method to update and draw the component
  this.update = function() {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "white";
    ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    ctx.restore();
    // Update game time
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    gameTime = new Date() - startTime;
    ctx.fillText("Time: " + formatTime(gameTime), myGameArea.canvas.width - 10, 40);
    ctx.fillText("Best score: " + formatTime(localStorage.getItem('bestScore')), myGameArea.canvas.width - 10, 70);

  }
  // Method to calculate the new position of the component
  this.newPos = function() {
      if (this.x - this.width / 2 < 0)
        this.speed_x = Math.random() * 4 + 1;
      else if ((this.x + this.width / 2) >= myGameArea.context.canvas.width)
        this.speed_x = -Math.random() * 4 - 1;
      if (this.y - this.height / 2 < 0)
        this.speed_y = -Math.random() * 4 - 1;
      else if ((this.y + this.height / 2) >= myGameArea.context.canvas.height)
        this.speed_y = Math.random() * 4 + 1;
      this.x += this.speed_x;
      this.y -= this.speed_y;
  }
  // Method to move the component with arrow keys
  this.moveWithArrows = function () {
    // Left arrow key
    if (keys[37]) {
      this.x -= 5; 
      if (this.x < 0) this.x = myGameArea.canvas.width; // If piece on left border
    } 
    // Right arrow key
    if (keys[39]) {
      this.x += 5; 
      if (this.x > myGameArea.canvas.width) this.x = 0; // If piece on right border
    }
    // Up arrow key
    if (keys[38]) {
      this.y -= 5; 
      if (this.y < 0) this.y = myGameArea.canvas.height; // If piece on top border
    }
    // Down arrow key
    if (keys[40]) {
      this.y += 5;  
      if (this.y > myGameArea.canvas.height) this.y = 0; // If piece on bottom border
    }
  }
}

// Function to check collision between two components
function checkCollision(content1, content2) {
  return(
    content1.x < content2.x + content2.width &&
    content1.x + content1.width > content2.x &&
    content1.y < content2.y + content2.height &&
    content1.y + content1.height > content2.y 
  );
}

// Function to update the game elements
function updateGameArea() {
  if(gameEnded) {
    gameOver();
    return;
  } 

  myGameArea.clear();
  myGamePiece.moveWithArrows();
  myGamePiece.update();

  for (var i = 0; i < asteroids.length; i++) {
    asteroids[i].newPos();
    asteroids[i].update();

    // Check collision with myGamePiece
    if (checkCollision(myGamePiece, asteroids[i])) {
      gameEnded = true;
      gameTime = new Date() - startTime;
      return;
    }

    // Check collision with other asteroids
    for (var j = i + 1; j < asteroids.length; j++) {
      if (checkCollision(asteroids[i], asteroids[j])) {
        asteroids[i].speed_x = -asteroids[i].speed_x;
        asteroids[i].speed_y = -asteroids[i].speed_y;
      
        asteroids[j].speed_x = -asteroids[j].speed_x;
        asteroids[j].speed_y = -asteroids[j].speed_y;
      }
    }
  }

  // Function to handle game over state
  function gameOver() {
    myGameArea.stop();

    // Update the best score in local storage
    if(gameTime > localStorage.getItem('bestScore'))
      localStorage.setItem('bestScore', gameTime);

    ctx = myGameArea.context
    ctx.fillStyle = "red";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", window.innerWidth / 2, window.innerHeight / 2);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Enter to start new game.", window.innerWidth / 2, window.innerHeight / 2 + 50);

    ctx.textAlign = "right";
    ctx.fillText("Time: " + formatTime(gameTime), myGameArea.canvas.width - 10, 40);
    ctx.fillText("Best score: " + formatTime(localStorage.getItem('bestScore')), myGameArea.canvas.width - 10, 70);
  }

}