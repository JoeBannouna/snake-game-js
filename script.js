// Get the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Make it take up whole page
canvas.width = 702;
canvas.height = 702;

let gameOver = false;

class Edible {
  constructor() {
    this.dimension = 14;
    this.decidePosition();
  }

  decidePosition(snake) {
    this.x = Math.round(Math.random() * (canvas.width - this.dimension));
    this.y = Math.round(Math.random() * (canvas.height - this.dimension));
  }

  render() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.dimension, this.dimension);
  }
}

// A block that will move every frame and will leave traces
class Snake {
  constructor(x, y, dimension) {
    this.x = x;
    this.y = y;
    this.dimension = dimension;

    // History for objects movements
    this.history = [];

    // The direction of the snake
    this.direction = this.right;

    // The snake's length
    this.length = 3;
  }

  render(coords) {
    if (typeof coords == "undefined") {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y, this.dimension, this.dimension);

      this.history.push([this.x, this.y]);
    } else {
      ctx.fillStyle = "green";
      ctx.fillRect(coords[0], coords[1], this.dimension, this.dimension);
    }
  }

  beenHereBefore([targetX, targetY]) {
    return typeof this.history.find(([x, y]) => x == targetX && y == targetY) !== "undefined";
  }

  validPosition([targetX, targetY]) {
    const beenHere = this.beenHereBefore([targetX, targetY]);
    const inCanvas =
      targetX >= 0 && targetX <= canvas.width - this.dimension && targetY >= 0 && targetY <= canvas.height - this.dimension;

    return !beenHere && inCanvas;
  }

  lastHistorySquare(coords) {
    const lastSquare = this.history[this.history.length - 2];
    return lastSquare[0] == coords[0] && lastSquare[1] == coords[1];
  }

  insideEdible(edible, coords) {
    const l1 = { x: coords[0], y: coords[1] };
    const r1 = { x: coords[0] + this.dimension, y: coords[1] + this.dimension };
    const l2 = { x: edible.x, y: edible.y };
    const r2 = { x: edible.x + edible.dimension, y: edible.y + edible.dimension };

    if (!(l1.x >= r2.x || l2.x >= r1.x) && !(l1.y >= r2.y || l2.y >= r1.y)) {
      this.length = this.length + 10;
      return true;
    }
    return false;
  }

  right(returnValue) {
    if (returnValue) return [this.x + this.dimension + 1, this.y];
    else {
      this.x = this.x + this.dimension + 1;
      this.render();
    }
  }
  left(returnValue) {
    if (returnValue) return [this.x - this.dimension - 1, this.y];
    else {
      this.x = this.x - this.dimension - 1;
      this.render();
    }
  }
  up(returnValue) {
    if (returnValue) return [this.x, this.y - this.dimension - 1];
    else {
      this.y = this.y - this.dimension - 1;
      this.render();
    }
  }
  down(returnValue) {
    if (returnValue) return [this.x, this.y + this.dimension + 1];
    else {
      this.y = this.y + this.dimension + 1;
      this.render();
    }
  }

  move() {
    const directionCoords = this.direction(true);
    const thing = this.validPosition(directionCoords);

    if (!thing) {
      gameOver = true;
      console.log("no");
    } else {
      if (this.history.length > this.length) this.history.shift();

      if (this.edible.length) this.edible.find((edible) => this.insideEdible(edible, directionCoords))?.decidePosition();

      this.clearBoardAndRenderGreen();
      this.direction();
    }
  }

  clearBoardAndRenderGreen = () => {
    clearBoard();
    this.history.map((coords) => this.render(coords));
  };

  random() {
    const right = this.validPosition(this.right(true));
    const left = this.validPosition(this.left(true));
    const up = this.validPosition(this.up(true));
    const down = this.validPosition(this.down(true));

    if (!right && !left && !up && !down) {
      gameOver = true;
      console.log("no");
    } else {
      const rand = Math.round(Math.random() * 4);
      switch (rand) {
        case 3:
          if (right) {
            this.clearBoardAndRenderGreen();
            this.right();
          } else this.random();
          break;

        case 0:
          if (left) {
            this.clearBoardAndRenderGreen();
            this.left();
          } else this.random();
          break;

        case 1:
          if (up) {
            this.clearBoardAndRenderGreen();
            this.up();
          } else this.random();
          break;

        case 2:
          if (down) {
            this.clearBoardAndRenderGreen();
            this.down();
          } else this.random();
          break;
      }
    }
  }
}

const block = new Snake(canvas.width / 2, canvas.height / 2, 12);
const edible = new Edible();

const clearBoard = () => {
  ctx.fillStyle = "black";
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();
};

block.edible = [edible];

function update() {
  // block.random();

  block.move();
  edible.render();
}

document.onkeypress = function (e) {
  e = e || window.event;
  if (!gameOver) {
    switch (e.code) {
      case "KeyW":
        block.lastHistorySquare(block.up(true)) || (block.direction = block.up);
        break;

      case "KeyS":
        block.lastHistorySquare(block.down(true)) || (block.direction = block.down);
        break;

      case "KeyA":
        block.lastHistorySquare(block.left(true)) || (block.direction = block.left);
        break;

      case "KeyD":
        block.lastHistorySquare(block.right(true)) || (block.direction = block.right);
        break;
    }
  }
};

const gameInterval = setInterval(() => {
  if (gameOver) clearInterval(gameInterval);
  else update();
}, 50);
