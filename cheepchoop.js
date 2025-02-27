import * as THREE from 'three';

// Constants
const RepeatFactor = 50;
const gravity = -0.4;
const jumpHeight = 8;
const walkSpeed = 1;
const runSpeed = 2;
const sensitivity = 0.002;
const sphereRadius = 5;
const platformLevels = [
    { name: 'wood', texture: 'Planks020_1K-JPG_Color.jpg', normal: 'Planks020_1K-JPG_NormalGL.jpg', size: 69 },
    { name: 'brick', texture: 'Bricks076A_1K-JPG_Color.jpg', normal: 'Bricks076A_1K-JPG_NormalGL.jpg', size: 50 },
    { name: 'sand', texture: 'Ground080_1K-JPG_Color.jpg', normal: 'Ground080_1K-JPG_NormalGL.jpg', size: 40 },
    { name: 'marble', texture: 'Marble012_1K-JPG_Color.jpg', normal: 'Marble012_1K-JPG_NormalGL.jpg', size: 30 },
    { name: 'obsidian', texture: 'Obsidian006_1K-JPG_Color.jpg', normal: 'Obsidian006_1K-JPG_NormalGL.jpg', size: 20 }
];
// To remove
let fly = false;

const manager = new THREE.LoadingManager();
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');

manager.onStart = function (url, itemsLoaded, itemsTotal) {
    progressBarContainer.style.display = 'block';
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    progressBar.style.width = (itemsLoaded / itemsTotal * 100) + '%';
};

manager.onLoad = function () {
    progressBarContainer.style.display = 'none';
    document.getElementById('bg').style.display = 'block';
};

let backgroundMusic;

function setupBackgroundMusic(music = 'Mind-Bender.mp3') {
    if (backgroundMusic) {
        if (backgroundMusic.src.endsWith(music)) return; // Don't reload same music
        backgroundMusic.pause();
    }
    
    backgroundMusic = new Audio(`assets/sounds/${music}`);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
}

function playBackgroundMusic() {
    if (!backgroundMusic) setupBackgroundMusic();
    backgroundMusic.play().catch(error => {
        console.log("Background music play failed:", error);
    });
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);

// Function to load textures
function loadTexture(manager, path) {
    return new THREE.TextureLoader(manager).load(path);
}

// ******************************  Create Player  ******************************
const geometrySphere = new THREE.SphereGeometry(5, 32, 32);
const rockMap = loadTexture(manager, 'assets/player/Rock020_1K-JPG_Color.jpg');
const rockNormalMap = loadTexture(manager, 'assets/player/Rock020_1K-JPG_NormalGL.jpg');
const materialSphere = new THREE.MeshStandardMaterial({ map: rockMap, normalMap: rockNormalMap });
const sphere = new THREE.Mesh(geometrySphere, materialSphere);
sphere.position.y = 10;


// ******************************  Create Ground  ******************************
const geometryPlane = new THREE.PlaneGeometry(5000, 5000, 500, 500); // Increased size
const grassMap = loadTexture(manager, 'assets/ground/Grass001_1K-JPG_Color.jpg');
const grassNormalMap = loadTexture(manager, 'assets/ground/Grass001_1K-JPG_NormalGL.jpg');
// Texture repeating
grassMap.wrapS = THREE.RepeatWrapping;
grassMap.wrapT = THREE.RepeatWrapping;
grassNormalMap.wrapS = THREE.RepeatWrapping;
grassNormalMap.wrapT = THREE.RepeatWrapping;

grassMap.repeat.set(RepeatFactor, RepeatFactor);
grassNormalMap.repeat.set(RepeatFactor, RepeatFactor);

const materialPlane = new THREE.MeshStandardMaterial({ map: grassMap, normalMap: grassNormalMap });
const plane = new THREE.Mesh(geometryPlane, materialPlane);
plane.rotateX(Math.PI * 1.5);

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
arrow.position.z = -10;
scene.add(arrow);

// ******************************  Create Platforms  ******************************
function createPlatforms(manager, levels) {
    const platforms = [];
    let lastPlatformPosition = new THREE.Vector3(0, 0, 0);

    levels.forEach((level, levelIndex) => {
        const numberOfPlatforms = levelIndex === levels.length - 1 ? 100 : 10; // Different count for last level
        for (let i = 0; i < numberOfPlatforms; i++) {
            let size = level.size + (Math.random() * level.size / 2 - 10);
            const geometryPlatform = new THREE.BoxGeometry(size, 3, size);
            const texture = loadTexture(manager, `assets/platforms/${level.texture}`);
            const normal = loadTexture(manager, `assets/platforms/${level.normal}`);
            const materialPlatform = new THREE.MeshStandardMaterial({ map: texture, normalMap: normal });
            const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

            platform.name = level.name;

            let newPosition = new THREE.Vector3();
            newPosition.y = lastPlatformPosition.y + 69;

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
    });

    return platforms;
}

const platforms = createPlatforms(manager, platformLevels);

// ******************************  Create Light  ******************************
const ambientLight = new THREE.AmbientLight();

// ******************************  Load Skybox  ******************************
const skybox = new THREE.TextureLoader(manager).load('assets/day-heavenly-space-scene-fluffy.jpg');

// ******************************  Add elements to scene  ******************************
scene.add(sphere, plane, ambientLight);
platforms.forEach(platform => {
    scene.add(platform);
});
scene.background = skybox;


// ******************************  Game Logic  ******************************

// Get key presses
let userHasInteracted = false;
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
    userHasInteracted = true;
    playBackgroundMusic();
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});
document.addEventListener('click', function () {
    userHasInteracted = true;
    playBackgroundMusic();
});
function keyIsPressed(key) {
    return keysPressed[key.toLowerCase()] === true;
}

// Game variables
let grounded = false;
let jumpVelocity = 0;
let momentum = new THREE.Vector3(0, 0, 0);
let maxHeight = 0;
const upVector = new THREE.Vector3(0, 1, 0);

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
    const distance = sphere.position.y - sphereRadius;

    // If the distance is less than or equal to zero, then the sphere is colliding with the plane
    return distance <= 0;
}

// Mouse controls variables
let isPointerLocked = false;
let yaw = 0;
let pitch = 0;


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

function playSound(soundPath, volume = 0.2) {
    if (!userHasInteracted) return;
    const sound = new Audio(soundPath);
    sound.volume = volume;
    sound.play().catch(error => {
        console.log("Audio play failed:", error);
    });
}

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
    if (keyIsPressed(' ') && (grounded || fly)) {  // To remove
        playSound("assets/sounds/se_common_jump.wav");
        jumpVelocity = jumpHeight;
        grounded = false;
    }

    if (!grounded) {
        jumpVelocity += gravity;
        if (jumpVelocity < -3) { jumpVelocity = -3; }
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
                switch (platform.name) {
                    case 'wood':
                        playSound("assets/sounds/se_common_landing_wood.wav");
                        document.getElementById('currentLevel').textContent = 'Wood';
                        break;

                    case 'brick':
                        playSound("assets/sounds/se_common_landing_brick.wav");
                        document.getElementById('currentLevel').textContent = 'Brick';
                        break;

                    case 'sand':
                        playSound("assets/sounds/se_common_landing_sand.wav");
                        document.getElementById('currentLevel').textContent = 'Sand';
                        break;

                    case 'marble':
                        playSound("assets/sounds/se_common_landing_marble.wav");
                        document.getElementById('currentLevel').textContent = 'Marble';
                        break;

                    case 'obsidian':
                        playSound("assets/sounds/se_common_landing_obsidian.wav");
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
        sphere.position.y = sphereRadius;
        jumpVelocity = 0;

        // Display the current level
        document.getElementById('currentLevel').textContent = 'Ground';

        if (!grounded) {
            playSound("assets/sounds/se_common_landing_grass.wav");
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
    if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
        document.getElementById('maxHeight').textContent = maxHeight;
    }

    // Adjust camera to follow the player
    const cameraOffset = new THREE.Vector3(0, 10, 30);
    const cameraRotationOffset = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    cameraOffset.applyEuler(cameraRotationOffset); // Apply rotations to the offset.

    camera.position.copy(sphere.position).add(cameraOffset);
    camera.lookAt(sphere.position);

    // Teleport if too far from origin
    if (onGround && sphere.position.distanceTo(new THREE.Vector3(0, sphere.position.y, 0)) > 500) {
        sphere.position.set(0, sphereRadius, 0);
        momentum.set(0, 0, 0);
        sphere.rotation.set(0, 0, 0);
        sphere.quaternion.set(0, 0, 0, 1);
        yaw = 0;
        pitch = 0;
    }
}

// ******************************  Game Loop  ******************************
let lastHeight; let fallDistance; let isFalling;
function animate() {
    requestAnimationFrame(animate);
    move();
    
    if (sphere.position.y < lastHeight) {
        fallDistance += lastHeight - sphere.position.y;
        if (fallDistance > 100 && !isFalling) {
            playSound("assets/sounds/se_common_oh-no.wav");
            isFalling = true;
            setTimeout(() => {
                setupBackgroundMusic('Past Sadness.mp3');
                playBackgroundMusic();
            }, 500);
        }
    } else if (grounded && isFalling) {
        setupBackgroundMusic('Mind-Bender.mp3');
        playBackgroundMusic();
        fallDistance = 0;
        isFalling = false;
    } else if (!isFalling) {
        fallDistance = 0;
    }

    // To remove
    if (keyIsPressed('f')) { fly = !fly; }
    
    lastHeight = sphere.position.y;
    arrow.position.y = 20 + Math.sin((performance.now() * 0.001) * 2) * 2;
    renderer.render(scene, camera);
}

animate();
