import { Wireframe } from 'three/examples/jsm/Addons.js';
import './cheepchoop.css'
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);

const geometrySphere = new THREE.SphereGeometry(5, 32, 32);
const rockMap = new THREE.TextureLoader().load('/assets/player/Rock020_1K-JPG_Color.jpg')
const rockNormalMap = new THREE.TextureLoader().load('/assets/player/Rock020_1K-JPG_NormalGL.jpg')
const materialSphere = new THREE.MeshStandardMaterial({ map: rockMap, normalMap: rockNormalMap });
const sphere = new THREE.Mesh(geometrySphere, materialSphere);

const geometryPlane = new THREE.PlaneGeometry(5000, 5000, 500, 500); // Increased size
const grassMap = new THREE.TextureLoader().load('/assets/ground/Grass001_1K-JPG_Color.jpg');
const grassNormalMap = new THREE.TextureLoader().load('/assets/ground/Grass001_1K-JPG_NormalGL.jpg');

// Texture repeating to prevent stretching
grassMap.wrapS = THREE.RepeatWrapping;
grassMap.wrapT = THREE.RepeatWrapping;
grassNormalMap.wrapS = THREE.RepeatWrapping;
grassNormalMap.wrapT = THREE.RepeatWrapping;

const desiredRepeatFactor = 50; // Adjust this to control the tiling
grassMap.repeat.set(desiredRepeatFactor, desiredRepeatFactor);
grassNormalMap.repeat.set(desiredRepeatFactor, desiredRepeatFactor);


const materialPlane = new THREE.MeshStandardMaterial({ map: grassMap, normalMap: grassNormalMap });
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.rotateX(Math.PI * 1.5); plane.position.y = -10;

scene.add(sphere, plane);

const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
// const pointLight = new THREE.PointLight(0xffffff, 50000); // Increase intensity
// pointLight.distance = 100000; // Increase light range
// pointLight.position.set(0, 200, 0);
// scene.add(pointLight);

const skybox = new THREE.TextureLoader().load('/assets/field-with-clouds.jpg');
scene.background = skybox;

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

const keysPressed = {};

document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

function keyIsPressed(key) {
    return keysPressed[key.toLowerCase()] === true;
}

let grounded = true;
let velocityY = 0;
let horizontalMomentum = new THREE.Vector3(0, 0, 0);
const gravity = -0.4;
const upVector = new THREE.Vector3(0, 1, 0);

function move() {
    let moveSpeed = keyIsPressed('Shift') ? 1.5 : 0.5;
    let moveDirection = new THREE.Vector3();

    if (keyIsPressed('w') || keyIsPressed('ArrowUp')) {
        moveDirection.z -= 1;
    }
    if (keyIsPressed('s') || keyIsPressed('ArrowDown')) {
        moveDirection.z += 1;
    }
    if (keyIsPressed('a') || keyIsPressed('ArrowLeft')) {
        moveDirection.x -= 1;
    }
    if (keyIsPressed('d') || keyIsPressed('ArrowRight')) {
        moveDirection.x += 1;
    }

    //Rotate and move the sphere
    moveDirection.normalize();
    const rotationAxis = new THREE.Vector3().crossVectors(upVector, moveDirection).normalize();
    const rotationAngle = moveDirection.length() * moveSpeed / 5;
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
    sphere.quaternion.premultiply(rotationQuaternion);
    if (grounded){
        // Update horizontal momentum based on current input.
        horizontalMomentum.copy(moveDirection).multiplyScalar(moveSpeed);
        sphere.position.add(moveDirection.clone().multiplyScalar(moveSpeed));
    } else {
        // Use horizontal momentum if in the air
        sphere.position.add(horizontalMomentum);
    }

    // Jump
    if (keyIsPressed(' ') && grounded) {
        velocityY = 8;
        grounded = false;
    }

    if (!grounded) {
        velocityY += gravity;
        sphere.position.y += velocityY;

        if (sphere.position.y <= 0) {
            sphere.position.y = 0;
            velocityY = 0;
            grounded = true;
        }
    }

    camera.position.x = sphere.position.x;
    camera.position.z = sphere.position.z + 30;
    camera.position.y = sphere.position.y + 10;
}

function animate() {
    requestAnimationFrame(animate);

    move();

    renderer.render(scene, camera);
}

animate();