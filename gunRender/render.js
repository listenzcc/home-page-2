import * as THREE from "three";

import Stats from "./jsm/libs/stats.module.js";

import { GUI } from "./jsm/libs/lil-gui.module.min.js";
import { TrackballControls } from "./jsm/controls/TrackballControls.js";
import { OBJLoader } from "./jsm/loaders/OBJLoader.js";
import { RGBELoader } from "./jsm/loaders/RGBELoader.js";
import { Water } from "./jsm/objects/Water2.js";

const statsEnabled = true;

let container, stats;

let camera, scene, renderer, controls;

// let gun11, gun12, gun13, gun21, gun22, gun23, ball1, knot1;

/*

At the view from the front, the objects are layout as:

--------------------------------
   ball1     gun11    gun21

   knot1     gun12    gun22

             gun13    gun23
--------------------------------

ball1:               Sphere of the mirror material
knot1:               Knot shape of the mirror material
gun11, gun12, gun13: Guns with different norms
gun21:               Gun of given norms
gun22:               Gun of wareframe
gun23:               Gun of computed norm

*/

// Setup positions
// x: left
// y: up
// z: front
const positionSetup = (() => {
    const gun11 = { x: 0, y: 1, z: 0 };
    const gun12 = { x: 0, y: 0, z: 0 };
    const gun13 = { x: 0, y: -1, z: 0 };

    const gun21 = { x: 1, y: 1, z: -1 };
    const gun22 = { x: 1, y: 0, z: -1 };
    const gun23 = { x: 1, y: -1, z: -1 };

    const ball1 = { x: -1, y: 1, z: 1 };
    const knot1 = { x: -1, y: -1, z: 1 };

    return { gun11, gun12, gun13, gun21, gun22, gun23, ball1, knot1 };
})();

const objects = {
    gun12: 0,
    cubeCamera: 0,
};

// Update a using b
function update(a, b) {
    for (let k in b) {
        // Prevent add not-exist attr
        if (!a.hasOwnProperty(k)) continue;
        a[k] = b[k];
    }
}

var speed = 0;
const params = {
    speed: 0,
    color: "#ffffff",
    scale: 4,
    flowX: 1,
    flowY: 1,
    environment: "",
};

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    camera.position.z = 2;

    controls = new TrackballControls(camera, renderer.domElement);

    // Scene

    scene.add(new THREE.HemisphereLight(0x443333, 0x222233, 4));

    // Guns

    // Far three guns

    // Gun 22, wireframe
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            var material = new THREE.MeshBasicMaterial({
                color: 0x00aaaa,
                wireframe: true,
                wireframeLinewidth: 0.1,
            });

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun22);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);
        });

    // Gun 21, Norm
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            const loader = new THREE.TextureLoader().setPath(
                "models/obj/cerberus/"
            );

            var material = new THREE.MeshStandardMaterial();

            const diffuseMap = loader.load("Cerberus_N.jpg");
            diffuseMap.encoding = THREE.sRGBEncoding;
            material.map = diffuseMap;

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun21);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);
        });

    // Gun 23, Computed norm
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            const loader = new THREE.TextureLoader().setPath(
                "models/obj/cerberus/"
            );

            var material = new THREE.MeshNormalMaterial();

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun23);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);
        });

    // Near three guns
    // gun13
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            const loader = new THREE.TextureLoader().setPath(
                "models/obj/cerberus/"
            );
            var material = new THREE.MeshStandardMaterial();

            material.roughness = 1; // attenuates roughnessMap
            material.metalness = 1; // attenuates metalnessMap

            const diffuseMap = loader.load("Cerberus_A.jpg");
            diffuseMap.encoding = THREE.sRGBEncoding;
            material.map = diffuseMap;
            // roughness is in G channel, metalness is in B channel
            material.metalnessMap = material.roughnessMap =
                loader.load("Cerberus_RM.jpg");
            material.normalMap = loader.load("Cerberus_R.jpg");

            material.map.wrapS = THREE.RepeatWrapping;
            material.roughnessMap.wrapS = THREE.RepeatWrapping;
            material.metalnessMap.wrapS = THREE.RepeatWrapping;
            material.normalMap.wrapS = THREE.RepeatWrapping;

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun13);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);
        });

    // Top
    // gun11
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            const loader = new THREE.TextureLoader().setPath(
                "models/obj/cerberus/"
            );
            var material = new THREE.MeshStandardMaterial();

            material.roughness = 1; // attenuates roughnessMap
            material.metalness = 1; // attenuates metalnessMap

            const diffuseMap = loader.load("Cerberus_A.jpg");
            diffuseMap.encoding = THREE.sRGBEncoding;
            material.map = diffuseMap;
            // roughness is in G channel, metalness is in B channel
            material.metalnessMap = material.roughnessMap =
                loader.load("Cerberus_RM.jpg");
            material.normalMap = loader.load("Cerberus_M.jpg");

            material.map.wrapS = THREE.RepeatWrapping;
            material.roughnessMap.wrapS = THREE.RepeatWrapping;
            material.metalnessMap.wrapS = THREE.RepeatWrapping;
            material.normalMap.wrapS = THREE.RepeatWrapping;

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun11);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);
        });

    // Middle, Original
    // gun12
    new OBJLoader()
        .setPath("models/obj/cerberus/")
        .load("Cerberus.obj", function (group) {
            const loader = new THREE.TextureLoader().setPath(
                "models/obj/cerberus/"
            );
            var material = new THREE.MeshStandardMaterial();

            material.roughness = 1; // attenuates roughnessMap
            material.metalness = 1; // attenuates metalnessMap

            const diffuseMap = loader.load("Cerberus_A.jpg");
            diffuseMap.encoding = THREE.sRGBEncoding;
            material.map = diffuseMap;
            // roughness is in G channel, metalness is in B channel
            material.metalnessMap = material.roughnessMap =
                loader.load("Cerberus_RM.jpg");
            material.normalMap = loader.load("Cerberus_N.jpg");

            material.map.wrapS = THREE.RepeatWrapping;
            material.roughnessMap.wrapS = THREE.RepeatWrapping;
            material.metalnessMap.wrapS = THREE.RepeatWrapping;
            material.normalMap.wrapS = THREE.RepeatWrapping;

            group.traverse(function (child) {
                if (child.isMesh) {
                    child.material = material;
                }
            });

            update(group.position, positionSetup.gun12);
            group.rotation.y = -Math.PI / 2;
            scene.add(group);

            objects.gun12 = group;
        });

    // ground

    const groundGeometry = new THREE.PlaneGeometry(5, 5);
    const groundMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        metalness: 0.4,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI * -0.5;
    ground.position.y = -3;
    scene.add(ground);

    const textureLoader = new THREE.TextureLoader();
    // textureLoader.load("textures/hardwood2_diffuse.jpg", function (map) {
    textureLoader.load("textures/uv_grid_opengl.jpg", function (map) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set(1, 1);
        groundMaterial.map = map;
        groundMaterial.needsUpdate = true;
    });

    // water

    const waterGeometry = new THREE.PlaneGeometry(5, 5);

    const water = new Water(waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2(params.flowX, params.flowY),
        textureWidth: 1024,
        textureHeight: 1024,
    });

    water.position.y = -3 + 0.2;
    water.rotation.x = Math.PI * -0.5;
    scene.add(water);

    // Surrounding
    const environments = {
        "Venice Sunset": { filename: "venice_sunset_1k.hdr" },
        Overpass: {
            filename: "pedestrian_overpass_1k.hdr",
        },
    };

    // Mirrors, Dynamic load by env
    function loadEnvironment(name) {
        if (environments[name].texture !== undefined) {
            scene.background = environments[name].texture;
            scene.environment = environments[name].texture;
            return;
        }

        const filename = environments[name].filename;
        new RGBELoader()
            .setPath("textures/equirectangular/")
            .load(filename, function (hdrEquirect) {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

                scene.background = hdrEquirect;
                scene.environment = hdrEquirect;
                environments[name].texture = hdrEquirect;

                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
                cubeRenderTarget.texture.type = THREE.HalfFloatType;
                objects.cubeCamera = new THREE.CubeCamera(
                    1,
                    1000,
                    cubeRenderTarget
                );
                update(objects.cubeCamera.position, positionSetup.ball1);

                const refMaterial = new THREE.MeshStandardMaterial({
                    envMap: cubeRenderTarget.texture,
                    roughness: 0.05,
                    metalness: 1,
                });

                const obj1 = new THREE.Mesh(
                    new THREE.TorusKnotBufferGeometry(0.5, 0.15, 100),
                    refMaterial
                );
                update(obj1.position, positionSetup.knot1);
                scene.add(obj1);

                const sphere = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(0.5, 8),
                    refMaterial
                );
                update(sphere.position, positionSetup.ball1);
                scene.add(sphere);

                objects.cubeCamera.update(renderer, scene);
            });
    }

    const gui = new GUI();

    gui.add(params, "speed", 0, 10).onChange(function (value) {
        speed = value;
    });
    gui.addColor(params, "color").onChange(function (value) {
        water.material.uniforms["color"].value.set(value);
    });
    gui.add(params, "scale", 1, 10).onChange(function (value) {
        water.material.uniforms["config"].value.w = value;
    });
    gui.add(params, "flowX", -1, 1)
        .step(0.01)
        .onChange(function (value) {
            water.material.uniforms["flowDirection"].value.x = value;
            water.material.uniforms["flowDirection"].value.normalize();
        });
    gui.add(params, "flowY", -1, 1)
        .step(0.01)
        .onChange(function (value) {
            water.material.uniforms["flowDirection"].value.y = value;
            water.material.uniforms["flowDirection"].value.normalize();
        });

    params.environment = Object.keys(environments)[0];

    loadEnvironment(params.environment);

    gui.add(params, "environment", Object.keys(environments)).onChange(
        function (value) {
            loadEnvironment(value);
        }
    );
    gui.open();

    //

    if (statsEnabled) {
        stats = new Stats();
        container.appendChild(stats.dom);
    }

    window.addEventListener("resize", onWindowResize);
}

//

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

//

function animate() {
    requestAnimationFrame(animate);

    objects.gun12.rotation.y -= speed * 0.01;

    objects.cubeCamera.update(renderer, scene);

    controls.update();
    renderer.render(scene, camera);

    if (statsEnabled) stats.update();
}
