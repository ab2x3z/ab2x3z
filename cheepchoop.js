import './cheepchoop.css'
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const geometry = new THREE.CapsuleGeometry(5, 10, 8, 64);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const capsule = new THREE.Mesh(geometry, material);
scene.add(capsule);

const pointLight = new THREE.PointLight(0xffffff, 420);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

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

let jump = false;

function animate() {
    requestAnimationFrame(animate);

    if (keyIsPressed('w')) {
        capsule.position.z -= 0.5;
    }
    if (keyIsPressed('s')) {
        capsule.position.z += 0.5;
    }
    if (keyIsPressed('a')) {
        capsule.position.x -= 0.5;
    }
    if (keyIsPressed('d')) {
        capsule.position.x += 0.5;
    }
    if (keyIsPressed(' ')) {
        jump = true;
    }

    if (jump && capsule.position.y < 15){
        capsule.position.y += 1.63;
    }
    if (capsule.position.y >= 15) {
        jump = false;
    }

    if (!jump && capsule.position.y > 0){
        capsule.position.y -= 0.98;
    }

    renderer.render(scene, camera);
}

animate();