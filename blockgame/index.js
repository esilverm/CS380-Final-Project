const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
let pxScale = window.devicePixelRatio;
let mouse = { x: 0, y: 0 };
let brickRows = 1;
let brickWidth = width / 10 - 40;

let time = 0;

function setup(e) {
  // width = canvas.width;
  // height = canvas.height;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  canvas.width = width * pxScale;
  canvas.height = height * pxScale;

  // normalize the coordinate system
  ctx.scale(pxScale, pxScale);

  draw(e);
}

function draw(e) {
  const mousePos = getMousePos(canvas, mouse);
  // draw to the canvas
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(mousePos.x - 150, height * 0.9, 300, 30);
  ctx.beginPath();
  ctx.fillStyle = "#FFFFFF";
  ctx.ellipse(mousePos.x, height * 0.9 - 20, 20, 20, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
  time++;

  if (time % 50 === 0) brickRows++;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 3;
  for (let i = 0; i < brickRows; i++) {
    ctx.beginPath();
    ctx.fillStyle = ["#FB0207", "#FEFF0B", "#0F7101", "#1500FF"][i % 4];
    for (let j = 0; j < width; j += brickWidth + 40) {
      ctx.rect(j + 20, i * 60 + 40, brickWidth, 40);
    }
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
  ctx.fillStyle = "#FFFFFF";

  if (brickRows >= 15) {
    ctx.font = "100px Arial";
    ctx.textAlign = "center";
    ctx.fillText("You Lose.", width / 2, height / 2);
  }
  requestAnimationFrame(draw);
}

// when the whole page has loaded, including all dependent resources
window.addEventListener("load", setup);
canvas.addEventListener("mousemove", (e) => {
  mouse = {
    x: e.clientX,
    y: e.clientY,
  };
});

// https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: evt.x - rect.left, // * scaleX, // scale mouse coordinates after they have
    y: evt.y - rect.top, //* scaleY, // been adjusted to be relative to element
  };
}
