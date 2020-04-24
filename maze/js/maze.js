/**
 * NOTE: THIS CODE STILL NEEDS A LOT OF WORK.
 *
 * I am submitting it at this state to show a proof of concept.
 *
 * Current assets were gathered from here https://github.com/ibid-11962/Windows-95-3D-Maze-Screensaver
 *
 * I hope to make my own with html canvas to better reflect the message i'd like convey.
 *
 * This is just to show that generating the maze with three.js is possible. My next steps are animation with the camera.
 *
 */

// main constants
const sizeMultiplier = 40;
const mazeWidth = 10;
const mazeHeight = 10;
const zOffset = sizeMultiplier / 2;

// three.js variables
let camera, scene, renderer, controls;
let geometry, material, mesh;

// things we will keep track of for animation
let pathHistoryArr = []; // path to curr position
let visited = new Array(mazeWidth).fill(new Array(mazeHeight).fill(0));
let maze;

let endPosition;
let endReached = false;

function init() {
  maze = generateMazeData(mazeWidth, mazeHeight);
  scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 25000); // FOV, aspect ration, near, far
  camera.position.set(0, sizeMultiplier / 4, 200); // x, y (move up), back out on the z-axis
  // camera.lookAt(width / 2, height / 2, sizeMultiplier / 4);
  scene.add(camera); // add camera to scene

  renderMaze(maze);

  renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true });
  renderer.setSize(width, height);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);
}

async function main() {
  maze = generateMazeData(mazeWidth, mazeHeight);
}

function renderMaze({ horizontalPlanes, verticalPlanes }) {
  renderFloorAndCeiling();
  renderHorizontal(horizontalPlanes);
  renderVertical(verticalPlanes);
}

function renderFloorAndCeiling() {
  let floorTexture = new THREE.TextureLoader().load("assets/floor.bmp");
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(mazeWidth * 5, mazeHeight * 5);
  let floorMaterial = new THREE.MeshBasicMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
  });
  let floorGeometry = new THREE.PlaneGeometry(
    mazeWidth * sizeMultiplier,
    mazeHeight * sizeMultiplier,
    10,
    10
  ); // x, y, vertices
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2; // rotate to lay flat
  floor.doubleSided = true;
  scene.add(floor);

  // LOAD CEILING
  let ceilingTexture = new THREE.TextureLoader().load("assets/ceiling.bmp");
  ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
  ceilingTexture.repeat.set(mazeWidth * 5, mazeHeight * 5);
  let ceilingMaterial = new THREE.MeshBasicMaterial({
    map: ceilingTexture,
    side: THREE.DoubleSide,
  });
  let ceilingGeometry = new THREE.PlaneGeometry(
    mazeWidth * sizeMultiplier,
    mazeHeight * sizeMultiplier,
    10,
    10
  ); // x, y, vertices
  let ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2; // rotate to lay flat
  ceiling.doubleSided = true;
  ceiling.position.y = sizeMultiplier / 2;
  // scene.add(ceiling);
}

function renderHorizontal(hPlanes) {
  let wallTexture = new THREE.TextureLoader().load("assets/brick.bmp");
  hPlanes.forEach((line, i) => {
    line.forEach((planeExists, j) => {
      if (planeExists) {
        // render plane
        let wallMaterial = new THREE.MeshBasicMaterial({
          map: wallTexture,
          side: THREE.DoubleSide,
        });

        let wallGeometry = new THREE.PlaneGeometry(
          sizeMultiplier,
          sizeMultiplier / 2
        );
        let wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(
          j * sizeMultiplier - (sizeMultiplier * mazeWidth) / 2 + zOffset,
          sizeMultiplier / 4,
          i * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2
        );
        scene.add(wall);
      }
    });
  });
}

function renderVertical(vPlanes) {
  let wallTexture = new THREE.TextureLoader().load("assets/brick.bmp");
  vPlanes.forEach((line, i) => {
    line.forEach((planeExists, j) => {
      if (planeExists) {
        // render plane
        let wallMaterial = new THREE.MeshBasicMaterial({
          map: wallTexture,
          side: THREE.DoubleSide,
        });

        let wallGeometry = new THREE.PlaneGeometry(
          sizeMultiplier,
          sizeMultiplier / 2
        );
        let wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(
          j * sizeMultiplier -
            sizeMultiplier / 2 -
            (sizeMultiplier * mazeWidth) / 2 +
            sizeMultiplier / 2,
          sizeMultiplier / 4,
          i * sizeMultiplier +
            sizeMultiplier / 2 -
            (sizeMultiplier * mazeHeight) / 2
        );
        wall.rotation.y = Math.PI / 2;
        scene.add(wall);
      }
    });
  });
}

function getCameraPos() {
  let position = camera.position;
  return {
    x: Math.round(position.x),
    y: position.y,
    z: Math.floor(position.z) + zOffset,
  };
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}

function windowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("load", () => {
  init();
  animate();
});
window.addEventListener("resize", windowResize);
