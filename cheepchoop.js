import * as THREE from 'three';

if (/Mobi|Android/i.test(navigator.userAgent)) {
    console.log(navigator.userAgent);
} else {
    console.log('no problems');
}

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

// ******************************  Create Arrow  ******************************
const arrowShape = new THREE.Shape();
arrowShape.moveTo(0, 0);
arrowShape.lineTo(-3, -6);
arrowShape.lineTo(-1.5, -6);
arrowShape.lineTo(-1.5, -15);
arrowShape.lineTo(1.5, -15);
arrowShape.lineTo(1.5, -6);
arrowShape.lineTo(3, -6);
arrowShape.lineTo(0, 0);
const extrudeSettings = {
    steps: 2,
    depth: 1,
    bevelEnabled: false,
};

const arrowGeometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
arrow.position.set(0, 10, -10);
scene.add(arrow);

// ******************************  Create Platforms  ******************************
const platforms = [];
let lastPlatformPosition = new THREE.Vector3(0, 0, 0); // Store the position of the last platform

// Wood level
for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(69 + (Math.random() * 34.5 - 10), 3, 69 + (Math.random() * 34.5 - 10));
    const plankMap = new THREE.TextureLoader().load('assets/platforms/Planks020_1K-JPG_Color.jpg')
    const plankNormalMap = new THREE.TextureLoader().load('assets/platforms/Planks020_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: plankMap, normalMap: plankNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

    // Name the platform to differentiate for the sound
    platform.name = 'wood';

    let newPosition = new THREE.Vector3();
    newPosition.y = lastPlatformPosition.y + 69;

    // Random Position on the perimeter of a circle with a radius of 69.
    let angle = Math.random() * 2 * Math.PI;
    let horizontalOffset = new THREE.Vector3(
        Math.cos(angle) * 69,
        0,
        Math.sin(angle) * 69
    );

    newPosition.x = lastPlatformPosition.x + horizontalOffset.x;
    newPosition.z = lastPlatformPosition.z + horizontalOffset.z;

    platform.position.copy(newPosition);


    platforms.push(platform);
    lastPlatformPosition.copy(newPosition);
}

// Brick level
for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(50 + (Math.random() * 25 - 10), 3, 50 + (Math.random() * 25 - 10));
    const brickMap = new THREE.TextureLoader().load('assets/platforms/Bricks076A_1K-JPG_Color.jpg')
    const brickNormalMap = new THREE.TextureLoader().load('assets/platforms/Bricks076A_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: brickMap, normalMap: brickNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

    // Name the platform to differentiate for the sound
    platform.name = 'brick';

    let newPosition = new THREE.Vector3();
    newPosition.y = lastPlatformPosition.y + 69;

    // Random Position on the perimeter of a circle with a radius of 69.
    let angle = Math.random() * 2 * Math.PI;
    let horizontalOffset = new THREE.Vector3(
        Math.cos(angle) * 69,
        0,
        Math.sin(angle) * 69
    );

    newPosition.x = lastPlatformPosition.x + horizontalOffset.x;
    newPosition.z = lastPlatformPosition.z + horizontalOffset.z;

    platform.position.copy(newPosition);


    platforms.push(platform);
    lastPlatformPosition.copy(newPosition);
}

// Sand level
for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(40 + (Math.random() * 20 - 10), 3, 40 + (Math.random() * 20 - 10));
    const sandMap = new THREE.TextureLoader().load('assets/platforms/Ground080_1K-JPG_Color.jpg')
    const sandNormalMap = new THREE.TextureLoader().load('assets/platforms/Ground080_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: sandMap, normalMap: sandNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

    // Name the platform to differentiate for the sound
    platform.name = 'sand';

    let newPosition = new THREE.Vector3();
    newPosition.y = lastPlatformPosition.y + 69;

    // Random Position on the perimeter of a circle with a radius of 69.
    let angle = Math.random() * 2 * Math.PI;
    let horizontalOffset = new THREE.Vector3(
        Math.cos(angle) * 69,
        0,
        Math.sin(angle) * 69
    );

    newPosition.x = lastPlatformPosition.x + horizontalOffset.x;
    newPosition.z = lastPlatformPosition.z + horizontalOffset.z;

    platform.position.copy(newPosition);


    platforms.push(platform);
    lastPlatformPosition.copy(newPosition);
}

// Marble level
for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(30 + (Math.random() * 15 - 10), 3, 30 + (Math.random() * 15 - 10));
    const marbleMap = new THREE.TextureLoader().load('assets/platforms/Marble012_1K-JPG_Color.jpg')
    const marbleNormalMap = new THREE.TextureLoader().load('assets/platforms/Marble012_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: marbleMap, normalMap: marbleNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

    // Name the platform to differentiate for the sound
    platform.name = 'marble';

    let newPosition = new THREE.Vector3();
    newPosition.y = lastPlatformPosition.y + 69;

    // Random Position on the perimeter of a circle with a radius of 69.
    let angle = Math.random() * 2 * Math.PI;
    let horizontalOffset = new THREE.Vector3(
        Math.cos(angle) * 69,
        0,
        Math.sin(angle) * 69
    );

    newPosition.x = lastPlatformPosition.x + horizontalOffset.x;
    newPosition.z = lastPlatformPosition.z + horizontalOffset.z;

    platform.position.copy(newPosition);


    platforms.push(platform);
    lastPlatformPosition.copy(newPosition);
}

// Obsidian level
for (let i = 0; i < 10; i++) {
    const geometryPlatform = new THREE.BoxGeometry(20 + (Math.random() * 10 - 10), 3, 20 + (Math.random() * 10 - 10));
    const obsidianMap = new THREE.TextureLoader().load('assets/platforms/Obsidian006_1K-JPG_Color.jpg')
    const obsidianNormalMap = new THREE.TextureLoader().load('assets/platforms/Obsidian006_1K-JPG_NormalGL.jpg')
    const materialPlatform = new THREE.MeshStandardMaterial({ map: obsidianMap, normalMap: obsidianNormalMap });
    const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

    // Name the platform to differentiate for the sound
    platform.name = 'obsidian';

    let newPosition = new THREE.Vector3();
    newPosition.y = lastPlatformPosition.y + 69;

    // Random Position on the perimeter of a circle with a radius of 69.
    let angle = Math.random() * 2 * Math.PI;
    let horizontalOffset = new THREE.Vector3(
        Math.cos(angle) * 69,
        0,
        Math.sin(angle) * 69
    );

    newPosition.x = lastPlatformPosition.x + horizontalOffset.x;
    newPosition.z = lastPlatformPosition.z + horizontalOffset.z;

    platform.position.copy(newPosition);


    platforms.push(platform);
    lastPlatformPosition.copy(newPosition);
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
    const boxSize = new THREE.Vector3(box.geometry.parameters.width / 2, 1.5, box.geometry.parameters.depth / 2); // Half the box size (assuming BoxGeometry is centered)

    // Get box min and max coordinates
    const boxMin = new THREE.Vector3().copy(boxPosition).sub(boxSize);
    const boxMax = new THREE.Vector3().copy(boxPosition).add(boxSize);

    // Check if the sphere is outside the platform's X and Z bounds
    if (spherePosition.x < boxMin.x - sphereRadius || spherePosition.x > boxMax.x + sphereRadius ||
        spherePosition.z < boxMin.z - sphereRadius || spherePosition.z > boxMax.z + sphereRadius) {
        return false; // Sphere is outside the platform's bounds
    }

    // Get closest point on box to sphere center
    const closestPoint = new THREE.Vector3();
    closestPoint.x = Math.max(boxMin.x, Math.min(spherePosition.x, boxMax.x));
    closestPoint.y = Math.max(boxMin.y, Math.min(spherePosition.y, boxMax.y));
    closestPoint.z = Math.max(boxMin.z, Math.min(spherePosition.z, boxMax.z));

    // Calculate distance between sphere center and closest point
    const distance = spherePosition.distanceTo(closestPoint);

    return distance <= sphereRadius;
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

    if (grounded) {
        // Update horizontal momentum based on current input.
        momentum.copy(rotatedMoveDirection).multiplyScalar(moveSpeed);
        sphere.position.add(momentum);
    } else {
        // Use horizontal momentum if in the air
        sphere.position.add(momentum);
    }

    // Jump
    if (keyIsPressed(' ') && grounded) {
        const jumpSound = new Audio("assets/sounds/se_common_jump.wav");
        jumpSound.volume = 0.2; jumpSound.play();
        jumpVelocity = jumpHeight;
        grounded = false;
    }

    if (!grounded) {
        jumpVelocity += gravity;
        if (jumpVelocity < -10) { jumpVelocity = -10; }
        sphere.position.y += jumpVelocity;
    }

    // Collision checks
    let onGround = checkSpherePlaneCollision(sphere, plane); // Check ground collision first
    let landedOnPlatformThisFrame = false; // Track if we just landed on a platform this frame
    let onPlatform = false;
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

                // Play the sound based on the material
                let landPlatformSound;
                switch (platform.name) {
                    case 'wood':
                        // Play sound
                        landPlatformSound = new Audio("assets/sounds/se_common_landing_wood.wav");
                        landPlatformSound.volume = 0.2;
                        landPlatformSound.play();
                        // Display the current level
                        document.getElementById('currentLevel').textContent = 'Wood';
                        break;

                    case 'brick':
                        // Play sound
                        landPlatformSound = new Audio("assets/sounds/se_common_landing_brick.wav");
                        landPlatformSound.volume = 0.2;
                        landPlatformSound.play();
                        // Display the current level
                        document.getElementById('currentLevel').textContent = 'Brick';
                        break;

                    case 'sand':
                        // Play sound
                        landPlatformSound = new Audio("assets/sounds/se_common_landing_sand.wav");
                        landPlatformSound.volume = 0.2;
                        landPlatformSound.play();
                        // Display the current level
                        document.getElementById('currentLevel').textContent = 'Sand';
                        break;

                    case 'marble':
                        // Play sound
                        landPlatformSound = new Audio("assets/sounds/se_common_landing_marble.wav");
                        landPlatformSound.volume = 0.2;
                        landPlatformSound.play();
                        // Display the current level
                        document.getElementById('currentLevel').textContent = 'Marble';
                        break;

                    case 'obsidian':
                        // Play sound
                        landPlatformSound = new Audio("assets/sounds/se_common_landing_obsidian.wav");
                        landPlatformSound.volume = 0.2;
                        landPlatformSound.play();
                        // Display the current level
                        document.getElementById('currentLevel').textContent = 'Obsidian';
                        break;

                    default:
                        console.log("Invalid platform name");
                        break;
                }
            } else if (jumpVelocity == 0) {
                onPlatform = true;
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

        // Display the current level
        document.getElementById('currentLevel').textContent = 'Ground';

        if (!grounded) {
            const landPlatformSound = new Audio("assets/sounds/se_common_landing_grass.wav");
            landPlatformSound.volume = 0.2;
            landPlatformSound.play();
        }
        grounded = true;
    } else if (!onPlatform) {
        // In the air
        grounded = false;
    }

    // Reset position if falls below ground
    if (sphere.position.y < plane.position.y + sphereRadius) {
        sphere.position.y = plane.position.y + sphereRadius;
        jumpVelocity = 0;
        grounded = true;
    }

    // Update the player height display
    const currentHeight = sphere.position.y < 0 ? 0 : Math.round(sphere.position.y / 10);
    document.getElementById('currentHeight').textContent = currentHeight;

    // Adjust camera to follow the player
    const cameraOffset = new THREE.Vector3(0, 10, 30);
    const cameraRotationOffset = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    cameraOffset.applyEuler(cameraRotationOffset); // Apply rotations to the offset.

    camera.position.copy(sphere.position).add(cameraOffset);
    camera.lookAt(sphere.position);

    // Teleport if too far from origin
    if (onGround && sphere.position.distanceTo(new THREE.Vector3(0, sphere.position.y, 0)) > 500) {
        sphere.position.set(0, -10 + sphereRadius, 0);
        momentum.set(0, 0, 0);
        sphere.rotation.set(0, 0, 0);
    }
}


function animate() {
    requestAnimationFrame(animate);

    move();

    // Make arrow move
    const arrowY = 10 + Math.sin((performance.now() * 0.001) * 2) * 2; // Oscillate between 8 and 12
    arrow.position.y = arrowY;

    renderer.render(scene, camera);
}


animate();
