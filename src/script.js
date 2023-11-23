import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const geometryCube = new THREE.BoxGeometry(6, 4, 5);
const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    opacity: 0
});
const cube = new THREE.Mesh( geometryCube, material );
cube.position.set(-0.5, 2, -2);

scene.add(cube);

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// GLTF loader
const gltfLoader = new GLTFLoader();

/**
 * Texture
 */
const bakedTexture = textureLoader.load('baked.jpg');
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;
bakedTexture.minFilter = THREE.LinearFilter;

/**
 * Material
 */

const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedTexture
});

/**
 * Model
 */

let psLogo;

gltfLoader.load('ps_bake.glb', (gltf) => {

    psLogo = gltf.scene;

    gltf.scene.traverse((child) => {
        // child.userData.clickTarget = gltf.scene;
        child.material = bakedMaterial;
    });

    scene.add(psLogo);
});

scene.position.set(0, -1.5, 0.25);

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = (event.clientY / sizes.height) * 2 + 1;
});

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 150);
camera.position.x = 4.5;
camera.position.y = 4.25
camera.position.z = 7

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.enableZoom = false;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI * 0.4;
controls.minAzimuthAngle = - Math.PI * 0.75;
controls.maxAzimuthAngle = Math.PI * 0.75;

// Sound
const listener = new THREE.AudioListener();
camera.add(listener);
let sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('PS1Startup.mp3', (buffer) => {
    sound.setBuffer(buffer);
    sound.setVolume(0.025);
    sound.autoplay = false;
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update();

    // raycaster
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    window.addEventListener('click', () => {

        if (intersects.length > 0) {
            sound.play();
        }
    });

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()