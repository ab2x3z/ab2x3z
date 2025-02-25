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

// ******************************  Create Player  ******************************
const geometrySphere = new THREE.SphereGeometry(5, 32, 32);
const rockMap = new THREE.TextureLoader().load('assets/player/Rock020_1K-JPG_Color.jpg')
const rockNormalMap = new THREE.TextureLoader().load('assets/player/Rock020_1K-JPG_NormalGL.jpg')
const materialSphere = new THREE.MeshStandardMaterial({ map: rockMap, normalMap: rockNormalMap });
const sphere = new THREE.Mesh(geometrySphere, materialSphere);
sphere.position.y = 5;


// ******************************  Create Ground  ******************************
const geometryPlane = new THREE.PlaneGeometry(5000, 5000, 500, 500); // Increased size
const grassMap = new THREE.TextureLoader().load('assets/ground/Grass001_1K-JPG_Color.jpg');
const grassNormalMap = new THREE.TextureLoader().load('assets/ground/Grass001_1K-JPG_NormalGL.jpg');
// Texture repeating
grassMap.wrapS = THREE.RepeatWrapping;
grassMap.wrapT = THREE.RepeatWrapping;
grassNormalMap.wrapS = THREE.RepeatWrapping;
grassNormalMap.wrapT = THREE.RepeatWrapping;

const RepeatFactor = 50;
grassMap.repeat.set(RepeatFactor, RepeatFactor);
grassNormalMap.repeat.set(RepeatFactor, RepeatFactor);

const materialPlane = new THREE.MeshStandardMaterial({ map: grassMap, normalMap: grassNormalMap });
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.rotateX(Math.PI * 1.5); plane.position.y = -10;

// ******************************  Create Platforms  ******************************
const platforms = [];

for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(50, 3, 50);
    const brickMap = new THREE.TextureLoader().load('assets/platforms/Bricks076A_1K-JPG_Color.jpg')
    const brickNormalMap = new THREE.TextureLoader().load('assets/platforms/Bricks076A_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: brickMap, normalMap: brickNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);
    platform.position.y = i * 20;
    platform.position.z = ((Math.random() * 2) - 1) * 100;
    platform.position.x = ((Math.random() * 2) - 1) * 100;

    platforms.push(platform)
}

// ******************************  Add elements to scene  ******************************
scene.add(sphere, plane);
platforms.forEach(platform => {
    scene.add(platform);
});

// ******************************  Add Light  ******************************
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);


// ******************************  Load Skybox  ******************************
const skybox = new THREE.TextureLoader().load('assets/day-heavenly-space-scene-fluffy.jpg');
scene.background = skybox;

// Helpers
// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);


// ******************************  Game Logic  ******************************

// Get key presses
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

// Adjustable game variables
let jumpHeight = 8;
let walkSpeed = 1;
let runSpeed = 2;
const gravity = -0.4;

// Game variables
let grounded = false;
let jumpVelocity = 0;
let momentum = new THREE.Vector3(0, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);
const sphereRadius = sphere.geometry.parameters.radius;

// Collision detection function (Sphere - Box)
function checkSphereBoxCollision(sphere, box) {
    const spherePosition = sphere.position.clone();
    const boxPosition = box.position.clone();
    const boxSize = new THREE.Vector3(25, 1.5, 25); // Half the box size (assuming BoxGeometry is centered)

    // Get box min and max coordinates
    const boxMin = new THREE.Vector3().copy(boxPosition).sub(boxSize);
    const boxMax = new THREE.Vector3().copy(boxPosition).add(boxSize);

    // Get closest point on box to sphere center
    const closestPoint = new THREE.Vector3();
    closestPoint.x = Math.max(boxMin.x, Math.min(spherePosition.x, boxMax.x));
    closestPoint.y = Math.max(boxMin.y, Math.min(spherePosition.y, boxMax.y));
    closestPoint.z = Math.max(boxMin.z, Math.min(spherePosition.z, boxMax.z));

    // Calculate distance between sphere center and closest point
    const distance = spherePosition.distanceTo(closestPoint);

    return distance < sphereRadius;
}

// Collision detection function (Sphere - Plane)
function checkSpherePlaneCollision(sphere, plane) {
    // Calculate the distance between the sphere's center and the plane
    const distance = sphere.position.y - (-10 + sphereRadius); // Plane y = -10

    // If the distance is less than or equal to zero, then the sphere is colliding with the plane
    return distance <= 0;
}

// Mouse controls variables
let isPointerLocked = false;
let yaw = 0;
let pitch = 0;
const sensitivity = 0.002; // Adjust as needed


// Function to lock pointer and hide cursor
function lockPointer() {
    const canvas = renderer.domElement;
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}

// Event listener for pointer lock change
document.addEventListener('pointerlockchange', pointerLockChange, false);
document.addEventListener('mozpointerlockchange', pointerLockChange, false);

function pointerLockChange() {
    if (document.pointerLockElement === renderer.domElement || document.mozPointerLockElement === renderer.domElement) {
        isPointerLocked = true;
    } else {
        isPointerLocked = false;
    }
}


// Mouse movement handler
function onMouseMove(event) {
    if (isPointerLocked) {
        const movementX = event.movementX || event.mozMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || 0;

        yaw -= movementX * sensitivity;
        pitch -= movementY * sensitivity;

        // Limit pitch to prevent looking too far up or down
        pitch = Math.max((-Math.PI / 2) + 0.5, Math.min(Math.PI / 2, pitch));
    }
}


document.addEventListener('mousemove', onMouseMove, false);

// Add click event to request pointer lock
renderer.domElement.addEventListener('click', function () {
    lockPointer();
});


function move() {
    let moveDirection = new THREE.Vector3();
    let moveSpeed = keyIsPressed('Shift') ? runSpeed : walkSpeed;

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

    //Apply camera rotation to move direction
    const cameraRotation = new THREE.Euler(0, yaw, 0, 'YXZ');
    const rotatedMoveDirection = new THREE.Vector3().copy(moveDirection).applyEuler(cameraRotation);


    const rotationAxis = new THREE.Vector3().crossVectors(upVector, rotatedMoveDirection).normalize();
    const rotationAngle = rotatedMoveDirection.length() * moveSpeed / 5;
    const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle);
    sphere.quaternion.premultiply(rotationQuaternion);

    if (grounded){
        // Update horizontal momentum based on current input.
        momentum.copy(rotatedMoveDirection).multiplyScalar(moveSpeed);
        sphere.position.add(momentum);
    } else {
        // Use horizontal momentum if in the air
        sphere.position.add(momentum);
    }



    // Jump
    if (keyIsPressed(' ') && grounded) {
        jumpVelocity = jumpHeight;
        grounded = false;
    }

    if (!grounded) {
        jumpVelocity += gravity;
        if (jumpVelocity < -4) { jumpVelocity = -4; }
        sphere.position.y += jumpVelocity;
    }

    // Collision checks
    let onGround = checkSpherePlaneCollision(sphere, plane); // Check ground collision first
    let landedOnPlatformThisFrame = false; // Track if we just landed on a platform this frame
    let closestPlatformY = -Infinity; // Keep track of the highest platform we are colliding with

    platforms.forEach(platform => {
        if (checkSphereBoxCollision(sphere, platform)) {
            // Sphere is colliding with a platform
            if (jumpVelocity < 0) { // Only snap to platform if falling
                // Determine if this is the closest platform
                if (platform.position.y > closestPlatformY) {
                    closestPlatformY = platform.position.y;
                }
                landedOnPlatformThisFrame = true; // Mark that we landed on a platform
            }
        }
    });

    if (landedOnPlatformThisFrame) {
        // Snap to the closest platform
        sphere.position.y = closestPlatformY + 1.5 + sphereRadius; // Adjust position to sit on platform
        jumpVelocity = 0;
        grounded = true;
    } else if (onGround) {
        // Sphere is on the ground
        sphere.position.y = -10 + sphereRadius; //Ground level is -10
        jumpVelocity = 0;
        grounded = true;
    } else {
        // In the air
        grounded = false;
    }

    // Reset position if falls below ground
    if (sphere.position.y < plane.position.y + sphereRadius) {
        sphere.position.y = plane.position.y + sphereRadius;
        jumpVelocity = 0;
        grounded = true;
    }


    // Adjust camera to follow the player
    const cameraOffset = new THREE.Vector3(0, 10, 30);
    const cameraRotationOffset = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    cameraOffset.applyEuler(cameraRotationOffset); // Apply rotations to the offset.

    camera.position.copy(sphere.position).add(cameraOffset);
    camera.lookAt(sphere.position);

}

function animate() {
    requestAnimationFrame(animate);

    move();

    renderer.render(scene, camera);
}

animate();