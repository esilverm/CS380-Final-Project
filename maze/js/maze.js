// Reference https://www.youtube.com/watch?v=7-yMd9Kt4mQ
// TODO: FIX POSITIONING OF THINGS

// main constants
const dev = true;

const sizeMultiplier = 50; // used so we can consider things in terms of the width and height and just use a const to scale up
const mazeWidth = 15;
const mazeHeight = 15;
const zOffset = sizeMultiplier / 2;

// three.js variables
let camera, scene, renderer, controls, startbtn;
let geometry, material, mesh;

// things we will keep track of for animation
let pathHistoryArr = []; // path to curr position
let visited = new Array(mazeWidth).fill(new Array(mazeHeight).fill(0));
let maze;

let endPosition;
let endReached = false;

function init() {
  scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 25000); // FOV, aspect ration, near, far
  camera.position.set(0, 300, 300);
  // camera.position.set(0, sizeMultiplier / 4, 200); // x, y (move up), back out on the z-axis
  // camera.lookAt(width / 2, height / 2, sizeMultiplier / 4);
  scene.add(camera); // add camera to scene

  renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true });
  renderer.setSize(width, height);

  dev && (controls = new THREE.OrbitControls(camera, renderer.domElement));

  document.body.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  main();
}

async function main() {
  maze = generateMazeData(mazeWidth, mazeHeight);
  renderMaze(maze);
  await initializeTraversal();
  console.log(endPosition);
  while (!endReached) {
    //traverseMaze(maze);
    endReached = true;
  }
}

function renderMaze({ horizontalPlanes, verticalPlanes }) {
  renderFloorAndCeiling();
  renderHorizontal(horizontalPlanes);
  renderVertical(verticalPlanes);
}

async function initializeTraversal() {
  let pos;
  let posArr = [];
  let y = sizeMultiplier / 4;

  for (let x = 0; x < mazeWidth; x++) {
    for (let z = 0; z < mazeHeight; z++) {
      posArr.push({ x, z });
    }
  }

  // make list of positions and shuffle them.
  posArr = _.shuffle(posArr);

  // get a position from the array and remove it
  pos = posArr.pop();

  // camera.position.set(...Object.values(coordsToPosition(pos)));
  // FOR TESTING
  var geometry = new THREE.SphereGeometry(sizeMultiplier / 16, 32, 32);
  var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  var sphere = new THREE.Mesh(geometry, material);
  // sphere.position.set(
  //   Object.values(coordsToPosition({ x: pos.x, z: pos.z }))[0],
  //   0,
  //   Object.values(coordsToPosition({ x: pos.x, z: pos.z }))[2]
  // );
  // scene.add(sphere);
  // FOR TESTING
  console.log(getCameraPos(), pos, coordsToPosition(pos), camera.position);

  pos = _.sample(
    getPossibleAdjacentSpots(maze, visited, {
      x: pos.x,
      y: sizeMultiplier / 4,
      z: pos.z,
    })
  );
  _.remove(posArr, (p) => p.x === pos.x && p.z === pos.z - 0.5);

  startbtn = await loadTexture("assets/start-button.jpg").then((texture) => {
    let startGeometry = new THREE.PlaneGeometry(
      0.6 * sizeMultiplier,
      0.2 * sizeMultiplier
    );
    let startMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    let startBtn = new THREE.Mesh(startGeometry, startMaterial);
    scene.add(startBtn);
    startBtn.position.set(
      ...Object.values(coordsToPosition({ x: pos.x, z: pos.z - 0.5 }))
    );
    startBtn.lookAt(camera.position);
    startMaterial.transparent = true;
    startMaterial.opacity = 0.5;
    return startBtn;
  });

  // FOR TESTING
  // var geometry = new THREE.SphereGeometry(sizeMultiplier / 16, 32, 32);
  // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  // camSphere = new THREE.Mesh(geometry, material);
  // camSphere.position.set(
  //   Object.values(coordsToPosition({ x: pos.x, z: pos.z - 0.5 }))[0],
  //   0,
  //   Object.values(coordsToPosition({ x: pos.x, z: pos.z - 0.5 }))[2]
  // );
  // scene.add(camSphere);
  // FOR TESTING

  // camera.lookAt(
  //   ...Object.values(coordsToPosition({ x: pos.x, z: pos.z - 0.5 }))
  // );

  // Goal
  // pos = posArr.pop();
  // await loadTexture("assets/smiley.png").then((texture) => {
  //   let endGeometry = new THREE.CircleGeometry(0.2 * sizeMultiplier, 50);
  //   let endMaterial = new THREE.MeshBasicMaterial({
  //     map: texture,
  //     side: THREE.DoubleSide,
  //   });
  //   let endBtn = new THREE.Mesh(endGeometry, endMaterial);
  //   scene.add(endBtn);
  //   endBtn.position.set(
  //     ...Object.values(coordsToPosition({ x: pos.x, z: pos.z }))
  //   );
  //   endBtn.lookAt(camera.position);
  //   endMaterial.transparent = true;
  //   endMaterial.opacity = 0.5;
  // });
  // endPosition = { x: pos.x, y: sizeMultiplier / 4, z: pos.z };
}

async function traverseMaze(maze) {
  let camPos = getCameraPos();
  let possiblePos = getPossibleAdjacentSpots(maze, visited, camPos);
  pathHistoryArr.push({ ...camPos });
  visited[camPos.z][camPos.x] = 1;
  console.log(camPos);

  //if we hit the goal
  if (
    Math.floor(camPos.x) === endPosition.x &&
    Math.floor(camPos.z) === endPosition.z
  ) {
    console.log("done!");
    endReached === true;
    return;
  }

  if (possiblePos.length === 0) {
    // if nowhere to go, go backwards
    pathHistoryArr.pop();
    let previousPos = pathHistoryArr.pop();
    let newRot = getCameraRot(previousPos);
    // animate to last position

    camera.lookAt(
      previousPos.x * sizeMultiplier -
        (sizeMultiplier * mazeHeight) / 2 +
        zOffset,
      sizeMultiplier / 4,
      previousPos.z * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2
    );
    camera.position.set(
      previousPos.x * sizeMultiplier -
        (sizeMultiplier * mazeHeight) / 2 +
        zOffset,
      sizeMultiplier / 4,
      previousPos.z * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2
    );
  } else {
    // choose a random position
    let newPos = _.sample(possiblePos);
    let newRot = getCameraRot(newPos);
    // animate to next Pos
    camera.lookAt(
      newPos.x * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2 + zOffset,
      sizeMultiplier / 4,
      newPos.z * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2
    );
    camera.position.set(
      newPos.x * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2 + zOffset,
      sizeMultiplier / 4,
      newPos.z * sizeMultiplier - (sizeMultiplier * mazeHeight) / 2
    );
  }
}

function animate() {
  requestAnimationFrame(animate);
  // TWEEN.update();
  let date = new Date(); // get date string
  let timer = date.getTime() * 0.0002; // get time string, changing speed
  camera.position.x = 800 * Math.cos(timer); // multiplier changes X coordinate
  camera.position.z = 500 * Math.sin(timer); // multiplier changes Z coordinates
  startbtn?.lookAt(camera.position);
  renderer.render(scene, camera);
  dev && controls.update();
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

// Maze Render Helpers
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
  !dev && scene.add(ceiling);
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
    x: Math.round(
      (position.x - zOffset + (sizeMultiplier * mazeWidth) / 2) / sizeMultiplier
    ),
    y: sizeMultiplier / 4,
    z: Math.floor(
      (position.z + (sizeMultiplier * mazeHeight) / 2) / sizeMultiplier
    ),
  };
}

function coordsToPosition({ x, z }) {
  return {
    x: x * sizeMultiplier + zOffset - (sizeMultiplier * mazeWidth) / 2,
    y: sizeMultiplier / 4,
    z: z * sizeMultiplier + zOffset - (sizeMultiplier * mazeHeight) / 2,
  };
}

function getCameraRot(newPos) {
  let currPos = getCameraPos();
  let diff = {
    x: currPos.x - newPos.x,
    y: currPos.z - newPos.z,
  };

  if (diff.z === -1) {
    return Math.PI;
  } else if (diff.z === 1) {
    return 0;
  } else if (diff.x === -1) {
    return -Math.PI / 2;
  } else if (diff.x === 1) {
    return Math.PI / 2;
  }
}

// Helper for traversing the maze. May need work.
function getPossibleAdjacentSpots(maze, visited, currPos) {
  let result = [];
  let movementOptions = [
    { x: -1, z: 0 }, // left
    { x: 1, z: 0 }, // right
    { x: 0, z: -1 }, // backwards
    { x: 0, z: 1 }, // forwards
  ];

  movementOptions.forEach(({ x, z }) => {
    let p = {
      x: Math.round(currPos.x) + x,
      y: currPos.y,
      z: Math.floor(currPos.z) + 0.5 + z,
    };

    let unvisited = false;
    // if within bounds of maze
    if (0 <= p.x && p.x < maze.width && 0 <= p.z && p.z < maze.height) {
      unvisited = !visited[Math.floor(p.z)][p.x];
    }

    // is path blocked by wall
    let notBlocked = true;
    if (x !== 0) {
      notBlocked = !maze.verticalPlanes[p.z - 0.5][x === -1 ? p.x + 1 : p.x];
    } else if (z !== 0) {
      notBlocked = !maze.horizontalPlanes[z === -1 ? p.z + 0.5 : p.z - 0.5][
        p.x
      ];
    }

    if (
      0 <= p.x &&
      p.x < maze.width &&
      0 <= p.z &&
      p.z < maze.height &&
      unvisited &&
      notBlocked
    ) {
      result.push(p);
    }
  });

  return result;
}

// Async Texture loading with promises
function loadTexture(url) {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(url, resolve);
  });
}
