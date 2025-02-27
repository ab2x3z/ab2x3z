import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';

// Add enum at the start of the file
const LevelType = {
    GROUND: { value: 0, name: 'Ground' },
    WOOD: { value: 1, name: 'Wood' },
    BRICK: { value: 2, name: 'Brick' },
    SAND: { value: 3, name: 'Sand' },
    MARBLE: { value: 4, name: 'Marble' },
    OBSIDIAN: { value: 5, name: 'Obsidian' }
};

// Constants
const RepeatFactor = 100;
const gravity = -0.4;
const jumpHeight = 8;
const walkSpeed = 1;
const runSpeed = 2;
const sensitivity = 0.002;
const sphereRadius = 5;
const platformLevels = [
    {
        type: LevelType.WOOD,
        texture: 'Planks020_1K-JPG_Color.jpg',
        normal: 'Planks020_1K-JPG_NormalGL.jpg',
        ao: 'Planks020_1K-JPG_AmbientOcclusion.jpg',
        displacement: 'Planks020_1K-JPG_Displacement.jpg',
        roughness: 'Planks020_1K-JPG_Roughness.jpg',
        size: 69
    },
    {
        type: LevelType.BRICK,
        texture: 'Bricks082A_1K-JPG_Color.jpg',
        normal: 'Bricks082A_1K-JPG_NormalGL.jpg',
        ao: 'Bricks082A_1K-JPG_AmbientOcclusion.jpg',
        displacement: 'Bricks082A_1K-JPG_Displacement.jpg',
        roughness: 'Bricks082A_1K-JPG_Roughness.jpg',
        size: 50
    },
    {
        type: LevelType.SAND,
        texture: 'Ground080_1K-JPG_Color.jpg',
        normal: 'Ground080_1K-JPG_NormalGL.jpg',
        ao: 'Ground080_1K-JPG_AmbientOcclusion.jpg',
        displacement: 'Ground080_1K-JPG_Displacement.jpg',
        roughness: 'Ground080_1K-JPG_Roughness.jpg',
        size: 40
    },
    {
        type: LevelType.MARBLE,
        texture: 'Marble012_1K-JPG_Color.jpg',
        normal: 'Marble012_1K-JPG_NormalGL.jpg',
        displacement: 'Marble012_1K-JPG_Displacement.jpg',
        roughness: 'Marble012_1K-JPG_Roughness.jpg',
        size: 30
    },
    {
        type: LevelType.OBSIDIAN,
        texture: 'Obsidian006_1K-JPG_Color.jpg',
        normal: 'Obsidian006_1K-JPG_NormalGL.jpg',
        displacement: 'Obsidian006_1K-JPG_Displacement.jpg',
        roughness: 'Obsidian006_1K-JPG_Roughness.jpg',
        size: 20
    }
];

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
const geometrySphere = new THREE.SphereGeometry(sphereRadius, 32, 32);
const rockMap = loadTexture(manager, 'assets/player/ChristmasTreeOrnament017_1K-JPG_Color.jpg');
const rockNormalMap = loadTexture(manager, 'assets/player/ChristmasTreeOrnament017_1K-JPG_NormalGL.jpg');
const rockRoughnessMap = loadTexture(manager, 'assets/player/ChristmasTreeOrnament017_1K-JPG_Roughness.jpg');
const rockMetalnessMap = loadTexture(manager, 'assets/player/ChristmasTreeOrnament017_1K-JPG_Metalness.jpg');
const rockDisplacementMap = loadTexture(manager, 'assets/player/ChristmasTreeOrnament017_1K-JPG_Displacement.jpg');

const materialSphere = new THREE.MeshStandardMaterial({
    map: rockMap,
    normalMap: rockNormalMap,
    roughnessMap: rockRoughnessMap,
    metalnessMap: rockMetalnessMap,
    displacementMap: rockDisplacementMap,
    displacementScale: 0.05,
    color: new THREE.Color(1, 1, 1).multiplyScalar(2),
    metalness: 0.6,
    roughness: 0
});
const sphere = new THREE.Mesh(geometrySphere, materialSphere);
sphere.position.y = 10;


// ******************************  Create Ground  ******************************
const groundSize = 5000;
const groundSegments = 500;
const geometryPlane = new THREE.PlaneGeometry(groundSize, groundSize, groundSegments, groundSegments);

const loadAndRepeatTexture = (manager, path, repeatFactor) => {
    const texture = loadTexture(manager, path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatFactor, repeatFactor);
    return texture;
};
const grassMap = loadAndRepeatTexture(manager, 'assets/ground/Grass001_1K-JPG_Color.jpg', RepeatFactor);
const grassNormalMap = loadAndRepeatTexture(manager, 'assets/ground/Grass001_1K-JPG_NormalGL.jpg', RepeatFactor);
const grassAoMap = loadAndRepeatTexture(manager, 'assets/ground/Grass001_1K-JPG_AmbientOcclusion.jpg', RepeatFactor);
const grassDisplacementMap = loadAndRepeatTexture(manager, 'assets/ground/Grass001_1K-JPG_Displacement.jpg', RepeatFactor);
const grassRoughnessMap = loadAndRepeatTexture(manager, 'assets/ground/Grass001_1K-JPG_Roughness.jpg', RepeatFactor);

const materialPlane = new THREE.MeshStandardMaterial({
    map: grassMap,
    normalMap: grassNormalMap,
    aoMap: grassAoMap,
    displacementMap: grassDisplacementMap,
    displacementScale: 2,
    roughnessMap: grassRoughnessMap,
    roughness: 1
});

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
            const displacement = loadTexture(manager, `assets/platforms/${level.displacement}`);
            const roughness = loadTexture(manager, `assets/platforms/${level.roughness}`);

            let materialPlatform;
            if (level.ao) {
                const ao = loadTexture(manager, `assets/platforms/${level.ao}`);
                materialPlatform = new THREE.MeshStandardMaterial({ map: texture, normalMap: normal, aoMap: ao, displacementMap: displacement, roughnessMap: roughness, displacementScale: 0 });
            } else {
                materialPlatform = new THREE.MeshStandardMaterial({ map: texture, normalMap: normal, displacementMap: displacement, roughnessMap: roughness, displacementScale: 0 });
            }

            const platform = new THREE.Mesh(geometryPlatform, materialPlatform);

            platform.levelType = level.type;

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

// ******************************  Create Sky  ******************************
const sky = new Sky();
sky.scale.setScalar( 450000 );
sky.material.uniforms.rayleigh.value = 0.1;
sky.material.uniforms.sunPosition.value = new THREE.Vector3( 1, Math.PI, Math.PI );

// ******************************  Create Light  ******************************
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1000, 0);

// ******************************  Add elements to scene  ******************************
scene.add(sphere, plane, sky, directionalLight, ambientLight);
platforms.forEach(platform => {
    scene.add(platform);
});
//scene.background = skybox;


// ******************************  Game Logic  ******************************

// Get key presses
let userHasInteracted = false;
let previousLevel;
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
    userHasInteracted = true;
    playBackgroundMusic();

    if (event.key === 'g') {
        godMode = !godMode;
        if (godMode) {
            previousLevel = document.getElementById('currentLevel').textContent;
            document.getElementById('currentLevel').textContent = 'GodMode';
        } else {
            document.getElementById('currentLevel').textContent = previousLevel;
        }
    }
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
let maxLevel = LevelType.GROUND;
let lastHeight;
let fallDistance;
let isFalling;
let godMode = false;
const upVector = new THREE.Vector3(0, 1, 0);

// Collision detection function (Sphere - Box)
function checkSphereBoxCollision(sphere, box) {
    const spherePosition = sphere.position.clone();
    const boxPosition = box.position.clone();
    const boxSize = new THREE.Vector3(box.geometry.parameters.width / 2, 1.5, box.geometry.parameters.depth / 2); // Half the box size

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

function getHeightColor(height) {
    const maxHeight = 1000;
    const value = Math.min(height, maxHeight) / maxHeight;

    let r, g, b;

    if (value < 0.33) {
        // Green to Yellow (0 to 0.33)
        r = Math.floor(255 * (value * 3));
        g = 255;
        b = 0;
    } else if (value < 0.66) {
        // Yellow to Red (0.33 to 0.66)
        r = 255;
        g = Math.floor(255 * (1 - ((value - 0.33) * 3)));
        b = 0;
    } else {
        // Red to Black (0.66 to 1.0)
        r = Math.floor(255 * (1 - ((value - 0.66) * 3)));
        g = 0;
        b = 0;
    }

    return `rgb(${r}, ${g}, ${b})`;
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

    if (grounded || godMode) {
        // Update horizontal momentum based on current input.
        momentum.copy(rotatedMoveDirection).multiplyScalar(moveSpeed);
        sphere.position.add(momentum);
    } else {
        // Use horizontal momentum if in the air
        sphere.position.add(momentum);
    }

    // Jump
    if (keyIsPressed(' ') && (grounded || godMode)) {
        if (!godMode) { playSound("assets/sounds/se_common_jump.wav"); }
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
                switch (platform.levelType) {
                    case LevelType.WOOD:
                        playSound("assets/sounds/se_common_landing_wood.wav");
                        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.WOOD.name;
                        if (maxLevel.value < LevelType.WOOD.value) {
                            maxLevel = LevelType.WOOD;
                            document.getElementById('maxHeight').style.setProperty('--maxLevel', `"${maxLevel.name}"`);
                        }
                        break;

                    case LevelType.BRICK:
                        playSound("assets/sounds/se_common_landing_brick.wav");
                        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.BRICK.name;
                        if (maxLevel.value < LevelType.BRICK.value) {
                            maxLevel = LevelType.BRICK;
                            document.getElementById('maxHeight').style.setProperty('--maxLevel', `"${maxLevel.name}"`);
                        }
                        break;

                    case LevelType.SAND:
                        playSound("assets/sounds/se_common_landing_sand.wav");
                        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.SAND.name;
                        if (maxLevel.value < LevelType.SAND.value) {
                            maxLevel = LevelType.SAND;
                            document.getElementById('maxHeight').style.setProperty('--maxLevel', `"${maxLevel.name}"`);
                        }
                        break;

                    case LevelType.MARBLE:
                        playSound("assets/sounds/se_common_landing_marble.wav");
                        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.MARBLE.name;
                        if (maxLevel.value < LevelType.MARBLE.value) {
                            maxLevel = LevelType.MARBLE;
                            document.getElementById('maxHeight').style.setProperty('--maxLevel', `"${maxLevel.name}"`);
                        }
                        break;

                    case LevelType.OBSIDIAN:
                        playSound("assets/sounds/se_common_landing_obsidian.wav");
                        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.OBSIDIAN.name;
                        if (maxLevel.value < LevelType.OBSIDIAN.value) {
                            maxLevel = LevelType.OBSIDIAN;
                            document.getElementById('maxHeight').style.setProperty('--maxLevel', `"${maxLevel.name}"`);
                        }
                        break;

                    default:
                        console.log("Invalid platform type");
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
        document.getElementById('currentLevel').textContent = godMode ? 'GodMode' : LevelType.GROUND.name;

        if (!grounded) {
            playSound("assets/sounds/se_common_landing_grass.wav");
        }
        grounded = true;
    } else if (!onPlatform) {
        // In the air
        grounded = false;
    }


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
        setupBackgroundMusic('Mind-Bender.mp3');
        playBackgroundMusic();
        fallDistance = 0;
    }

    lastHeight = sphere.position.y;

    // Reset position if falls below ground
    if (sphere.position.y < plane.position.y + sphereRadius) {
        sphere.position.y = plane.position.y + sphereRadius;
        jumpVelocity = 0;
        grounded = true;
    }

    // Update the player height display
    let currentHeight = sphere.position.y < 0 ? 0 : Math.round(sphere.position.y / 10);
    const heightElement = document.getElementById('currentHeight');
    heightElement.textContent = `${currentHeight} m`;
    heightElement.style.color = getHeightColor(currentHeight);
    heightElement.style.borderColor = getHeightColor(currentHeight);

    if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
        document.getElementById('maxHeight').textContent = `${maxHeight} m`;
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
function animate() {
    requestAnimationFrame(animate);
    move();

    if (godMode) {
        sphere.material.color.set(0xff0000);
    } else {
        sphere.material.color.set(0xffffff);
    }

    arrow.position.y = 20 + Math.sin((performance.now() * 0.001) * 2) * 2;
    renderer.render(scene, camera);
}

animate();
