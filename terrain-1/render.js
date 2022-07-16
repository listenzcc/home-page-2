console.log("The render.js is loaded.");

// Imports
import * as THREE from "three";
import Stats from "./jsm/libs/stats.module.js";

import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { ImprovedNoise } from "./jsm/math/ImprovedNoise.js";

// Single instance
const scene = new THREE.Scene();
const stats = new Stats();

// Generate terrain
const worldWidth = 256,
    worldDepth = 256,
    worldHalfWidth = worldWidth / 2,
    worldHalfDepth = worldDepth / 2;

const data = generateHeight(worldWidth, worldDepth);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// windows
function mkScreen(id, ratio, useControls = false, addSphere = true) {
    //
    const container = document.getElementById(id);
    container.style.height = container.clientWidth * ratio;

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        10,
        20000
    );

    //
    container.appendChild(renderer.domElement);

    //
    let controls = 0;
    if (useControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 1000;
        controls.maxDistance = 10000;
        controls.maxPolarAngle = Math.PI / 2;

        //
        controls.target.y =
            data[worldHalfWidth + worldHalfDepth * worldWidth] + 500;
        camera.position.y = controls.target.y + 2000;
        camera.position.x = 2000;
        controls.update();
    }

    //
    const cameraHelper = new THREE.CameraHelper(camera);

    //
    const material = new THREE.MeshNormalMaterial();
    const geometry = new THREE.SphereGeometry(100, 10, 10);
    const sphere = new THREE.Mesh(geometry, material);

    const changePosition = () => {
        camera.position.copy(sphere.position);
    };

    return {
        container,
        renderer,
        camera,
        cameraHelper,
        sphere,
        controls,
        id,
        ratio,
        changePosition,
    };
}

const screen2 = mkScreen("scene-2-container", 0.5);
const screen3 = mkScreen("scene-3-container", 0.5);
const screen4 = mkScreen("scene-4-container", 0.5);

[screen2, screen3, screen4].map((screen) => {
    scene.add(screen.sphere);
    scene.add(screen.cameraHelper);
});

const screen1 = mkScreen("scene-1-container", 0.8, true);

screen1.camera.position.x = 10000;
screen1.camera.position.y = 5000;
screen1.camera.position.z = 5000;
screen1.camera.lookAt(new THREE.Vector3(0, 0, 0));

//

function fillScene() {
    //
    scene.background = new THREE.Color(0xbfd1e5);

    //
    const geometryTerrain = new THREE.PlaneGeometry(
        7500,
        7500,
        worldWidth - 1,
        worldDepth - 1
    );
    geometryTerrain.rotateX(-Math.PI / 2);

    //
    const vertices = geometryTerrain.attributes.position.array;
    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
        vertices[j + 1] = data[i] * 10;
    }

    //
    const texture = new THREE.CanvasTexture(
        generateTexture(data, worldWidth, worldDepth)
    );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mesh = new THREE.Mesh(
        geometryTerrain,
        new THREE.MeshBasicMaterial({ map: texture })
    );
    scene.add(mesh);

    //
    const geometryHelper = new THREE.ConeGeometry(200, 1000, 3);
    geometryHelper.translate(0, 50, 0);
    geometryHelper.rotateX(Math.PI / 2);

    //
    const surfaceNorm = new THREE.Mesh(
        geometryHelper,
        new THREE.MeshNormalMaterial()
    );
    scene.add(surfaceNorm);

    return { mesh, texture, surfaceNorm };
}

const { mesh, surfaceNorm } = fillScene();

//
init();
animate();

onWindowResize();

window.addEventListener("resize", onWindowResize);

//
function onWindowResize() {
    // Resize screens
    [screen1, screen2, screen3, screen4].map((screen) => {
        const { container, renderer, camera, ratio } = screen;

        // Resize
        container.style.height = container.clientWidth * ratio;

        // Update camera and renderer
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    console.log("Window is resized");
}

function init() {
    const { container } = screen1;

    container.addEventListener("pointermove", onPointerMove);

    stats.dom.style.position = "";
    container.appendChild(stats.dom);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0005;

    screen2.sphere.position.y = 3000;
    screen2.sphere.position.x = Math.sin(time * 0.7) * 3000;
    screen2.sphere.position.z = Math.cos(time * 0.3) * 3000;
    screen2.changePosition();

    screen3.sphere.position.y = 5000;
    screen3.sphere.position.x = Math.sin(time * 0.2) * 3000;
    screen3.sphere.position.z = Math.cos(time * 0.4) * 3000;
    screen3.changePosition();

    screen4.sphere.position.y = 4000;
    screen4.sphere.position.x = Math.sin(time * 0.5) * 3000;
    screen4.sphere.position.z = Math.cos(time * 0.7) * 3000;
    screen4.changePosition();

    let bool = true;
    if (intersects) {
        if (intersects.length > 0) {
            screen2.camera.lookAt(intersects[0].point);
            screen3.camera.lookAt(intersects[0].point);
            screen4.camera.lookAt(intersects[0].point);
            bool = false;
        }
    }

    if (bool) {
        screen2.camera.lookAt(new THREE.Vector3(0, 0, 0));
        screen3.camera.lookAt(new THREE.Vector3(0, 0, 0));
        screen4.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    render();

    stats.update();
}

function render() {
    screen1.renderer.render(scene, screen1.camera);
    screen2.renderer.render(scene, screen2.camera);
    screen3.renderer.render(scene, screen3.camera);
    screen4.renderer.render(scene, screen4.camera);
}

var intersects;

// Toolbox
function onPointerMove(event) {
    pointer.x =
        (event.offsetX / screen1.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y =
        -(event.offsetY / screen1.renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, screen1.camera);

    // See if the ray from the camera into the world hits one of our meshes
    intersects = raycaster.intersectObject(mesh);

    // Toggle rotation bool for meshes that we clicked
    if (intersects.length > 0) {
        surfaceNorm.position.set(0, 0, 0);
        surfaceNorm.position.copy(intersects[0].point);
        surfaceNorm.lookAt(intersects[0].face.normal);

        // screen2.camera.lookAt(intersects[0].point);
        // screen3.camera.lookAt(intersects[0].point);
        // screen4.camera.lookAt(intersects[0].point);
    }
}

function generateHeight(width, height) {
    const size = width * height,
        data = new Uint8Array(size),
        perlin = new ImprovedNoise(),
        z = Math.random() * 100;

    let quality = 1;

    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < size; i++) {
            const x = i % width,
                y = ~~(i / width);
            data[i] += Math.abs(
                perlin.noise(x / quality, y / quality, z) * quality * 1.75
            );
        }

        quality *= 5;
    }

    return data;
}

function generateTexture(data, width, height) {
    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3(0, 0, 0);

    const sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
        vector3.x = data[j - 2] - data[j + 2];
        vector3.y = 2;
        vector3.z = data[j - width * 2] - data[j + width * 2];
        vector3.normalize();

        shade = vector3.dot(sun);

        imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
        imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
        imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
    }

    context.putImageData(image, 0, 0);

    // Scaled 4x

    const canvasScaled = document.createElement("canvas");
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext("2d");
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (let i = 0, l = imageData.length; i < l; i += 4) {
        const v = ~~(Math.random() * 5);

        imageData[i] += v;
        imageData[i + 1] += v;
        imageData[i + 2] += v;
    }

    context.putImageData(image, 0, 0);

    return canvasScaled;
}
