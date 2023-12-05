import * as THREE from "three";

const parameters = {
  materialColor: "#c2252f",
  particlesColor: "#c2252f",
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//objects

//tyexture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");

gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;

//mat4erial

const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

const objectDistance = 4;

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1.2, 0.11, 20, 100),
  material
);

mesh1.position.x = 1;
mesh1.position.y = -objectDistance * 0;

scene.add(mesh1);

const sectionMeshes = [mesh1];
//particles
const particlesCount = 4000;
const positions = new Float32Array(particlesCount * 3);
let positionsArray = positions;

for (let i = 0; i < particlesCount * 3; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 25;
  positions[i * 3 + 1] =
    (objectDistance * 0.5 -
      Math.random() * objectDistance * (sectionMeshes.length + 2)) *
      2 +
    5;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 20;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

//material

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.particlesColor,
  sizeAttenuation: true,
  size: 0.1,
});

const colors = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  colors[i * 3 + 0] = Math.random();
  colors[i * 3 + 1] = Math.random();
  colors[i * 3 + 2] = Math.random();
}
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);
//lights

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  if (!isScrolling) {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.document.documentElement.clientHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    updateMeshPosition();
  }
});

/**
 * Camera
 */

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//scroll
let scrollY = window.scrollY;

//cursor
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

let targetScrollY = window.scrollY;
let currentScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  isScrolling = true;
  targetScrollY = window.scrollY;
  clearTimeout(window.scrollFinished);
  window.scrollFinished = setTimeout(() => {
    isScrolling = false;
  }, 100);
});

const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

let targetMeshPosition = { x: mesh1.position.x, y: mesh1.position.y };

function updateMeshPosition() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    targetMeshPosition.x = 0;
    targetMeshPosition.y = 0;
  } else {
    targetMeshPosition.x = 1;
    targetMeshPosition.y = -objectDistance * 0;
  }
}

// Call the function initially
updateMeshPosition();

// Update the mesh position on window resize
let isScrolling = false;
window.addEventListener("scroll", () => {
  isScrolling = true;
  clearTimeout(window.scrollFinished);
  window.scrollFinished = setTimeout(() => {
    isScrolling = false;
  }, 100);
});

window.addEventListener("resize", () => {
  if (isScrolling) return;
  updateMeshPosition();
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update currentScrollY towards targetScrollY
  currentScrollY = lerp(currentScrollY, targetScrollY, 0.1);

  // Use currentScrollY instead of scrollY for camera position
  camera.position.y = (-currentScrollY / sizes.height) * objectDistance;

  const parallaxX = cursor.x * 0.8;
  const parallaxY = -cursor.y * 0.8;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 2 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 2 * deltaTime;

  //animate meshes
  sectionMeshes[0].rotation.x = elapsedTime * 0.07;
  sectionMeshes[0].rotation.y = -elapsedTime * 0.1;

  mesh1.position.x = lerp(mesh1.position.x, targetMeshPosition.x, 0.05);
  mesh1.position.y = lerp(mesh1.position.y, targetMeshPosition.y, 0.05);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
