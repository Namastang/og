let myGameArea = {
  canvas: document.createElement("canvas"),
  start : function() {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
        /* Multiple Keys Controller */
    window.addEventListener('keydown', function(e) {
      myGameArea.keys = (myGameArea.keys || []);
      myGameArea.keys[e.keyCode] = (e.type == "keydown");
    });
    window.addEventListener('keyup', function(e) {
      myGameArea.keys[e.keyCode] = (e.type == "keydown");
    });
        /* Mouse Move Control */
  /*  window.addEventListener('mousemove', function(e) {
      myGameArea.x = e.pageX;
      myGameArea.y = e.pageY;
    });
    */
    /* for touch use touchmove - we cant run that*/
    window.addEventListener('touchmove', function(e) {
      myGameArea.x = e.touches[0].screenX;
      myGameArea.y = e.touches[0].screenY;
    });
    
  },
  clear: function () {
    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
  },
  stop: function() {
    clearInterval(this.interval);
  }
}

let myGamePiece;
let myObstacles = [];
let myScore;
let myBackground;
let mySound;
function component(width, height, color,  x,  y, type) {
  this.type = type;
  if (type == "background") {
      this.image = new Image();
      this.image.src = color;
  }
  
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.gravity = 0.05;
  this.gravitySpeed = 0;
  this.angle = 0;
  this.bounce = 0.6;
  
  this.update = function() {
    ctx = myGameArea.context;
    if (this.type === "text") {
      ctx.font = this.width + " "+ this.height;
      ctx.fillStyle = color;
      ctx.fillText(this.text, this.x, this.y);
    } else if (this.type === "background") {
       ctx.drawImage(this.image, 
              this.x, 
              this.y,
              this.width, this.height);
      ctx.drawImage(this.image, 
                    this.x + this.width, 
                    this.y,
              this.width, this.height);

    } else if (type === "piece") {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = color;
      ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  this.newPos = function() {
   this.gravitySpeed += this.gravity;
   this.x += this.speedX;
   this.y += this.speedY + this.gravitySpeed;
   this.hitBottom();
   if (this.type === "background") {
     if (this.x === -(this.width)) {
       this.x = 0;
     }
    }

  }
  
  this.hitBottom = function() {
     const rockbottom = myGameArea.canvas.height - this.height;
     if (this.y > rockbottom) {
       this.y = rockbottom;
      this.gravitySpeed = -(this.gravitySpeed * this.bounce);
     }
  }
  this.crashWith = function(otherObj) {
    let myleft = this.x;
    let myright = this.x + (this.width);
    let mytop = this.y;
    let mybottom = this.y + (this.height);
    let otherleft = otherObj.x;
    let otherright = otherObj.x + (otherObj.width);
    let othertop = otherObj.y;
    let otherbottom = otherObj.y + (otherObj.height);
    
    let crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

function accelerate(n) {
   myGamePiece.gravity = n;
}

function updateGameArea() {
  let x, y;
    for (let i=0; i<myObstacles.length; i++) {
      if (myGamePiece.crashWith(myObstacles[i])) {
        // Sound PLAY
        mySound.play();
        myGameArea.stop();
        return;
      }   
    }
    myGameArea.clear();
    myGamePiece.angle += 1 * Math.PI / 180;
    //myBackground.speedX -= 0.1;
    myBackground.newPos();    
    myBackground.update();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo === 1 || everyinterval(150)) {
      x = myGameArea.canvas.width;
      minHeight = 20;
      maxHeight = 200;
      height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      minGap = 50;
      maxGap = 200;
      gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
    //  y = myGameArea.canvas.height - 200;
      myObstacles.push(new component(10, height, "blue", x, 0))
      myObstacles.push(new component(10, x-height-gap, "green", x, height+gap));
    }
    for(let i=0; i<myObstacles.length; i++) {
      myObstacles[i].x += -1;
      myObstacles[i].update();
    }
    myScore.text = "SCORE:" + myGameArea.frameNo;
    myScore.update();
    //myObstacle.update();
    //myObstacle.x += -1;
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    
    /* Keys Controller */
    if (myGameArea.keys && myGameArea.keys[37]) {
      myGamePiece.speedX =- 1;
    }
    if (myGameArea.keys && myGameArea.keys[39]) {
      myGamePiece.speedX = 1;
    }
    if (myGameArea.keys && myGameArea.keys[38]) {
      myGamePiece.speedY =- 1; 
    }
    if (myGameArea.keys && myGameArea.keys[40]) {
      myGamePiece.speedY = 1;
    }
    /* Mouse Move Control */
    if (myGameArea.x && myGameArea.y) {
      myGamePiece.x = myGameArea.x;
      myGamePiece.y = myGameArea.y;
    }
    myGamePiece.newPos();
    myGamePiece.update();
}

 function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  }
  this.stop = function() {
    this.sound.pause();
  }
}

function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == 0) {
    return true;
  }
  return false;
}

function moveup() {
  myGamePiece.speedY -= 1;
}
function movedown() {
    myGamePiece.speedY += 1;
}
function moveleft() {
    myGamePiece.speedX -= 1;
}
function moveright() {
  myGamePiece.speedX += 1;
}
function startGame() {
  myGamePiece = new component(30,30, "red", 10, 120, "piece");
  myObstacle = new component(10, 200, "green", 300, 120);
  myBackground = new component(490,290,"https://cdn.concreteplayground.com/content/uploads/2022/03/Sonic-the-Hedgehog-2_02_supplied-1920x1440.jpg",0,0,"background")
  myScore = new component("30px","Arial","white",28,40,"text")
  mySound = new sound("tunnelvision.mp3");
  myGameArea.start()
}
startGame()