console.log("THREE.js:", THREE);

const normals = angleNormals;

const mkBrainModel = (_cells, _vertices, idx = "0") => {
    const cells = _cells
        .filter((e) => e.idx === idx)
        .map((e) => [parseInt(e.v2), parseInt(e.v1), parseInt(e.v0)]);

    const positions = _vertices
        .filter((e) => e.idx === idx)
        .map((e) => [parseFloat(e.z), parseFloat(e.x), parseFloat(e.y)]);

    const colors = _cells.map((e) => [0.4, 0.4, 0.4, 0.5]);

    return { cells, positions, colors };
};

const mkVertices = (meshModel) => {
    const { positions, cells } = meshModel;
    const norms = normals(cells, positions);

    const vertices = [];

    const uv3 = [
        [0, 0],
        [0, 1],
        [1, 0],
    ];

    let pos, norm, uv;
    for (const cell of cells) {
        for (let i = 0; i < 3; i++) {
            pos = positions[cell[i]];
            norm = norms[cell[i]];
            uv = uv3[i];
            vertices.push({ pos, norm, uv });
        }
    }

    return vertices;
};

const mkGeometry = (vertices) => {
    const positions = [];
    const normals = [];
    const uvs = [];
    for (const vertex of vertices) {
        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);
    }

    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    const positionAttr = new THREE.BufferAttribute(
        new Float32Array(positions),
        positionNumComponents
    );
    const normalAttr = new THREE.BufferAttribute(
        new Float32Array(normals),
        normalNumComponents
    );
    const uvAttr = new THREE.BufferAttribute(
        new Float32Array(uvs),
        uvNumComponents
    );

    geometry.setAttribute("position", positionAttr);
    geometry.setAttribute("normal", normalAttr);
    geometry.setAttribute("uv", uvAttr);

    return geometry;
};

const camera = (() => {
    const fov = 45;
    const aspect = 16 / 9;
    const near = 1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(150, 200, -150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
})();

const mkScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001b42);

    const intensity = 1;
    const light = new THREE.AmbientLight(0xffffff, intensity);

    scene.add(light);

    const light1 = new THREE.SpotLight(0x00ff00);
    light1.position.y = 100;
    scene.add(light1);

    // const helper1 = new THREE.SpotLightHelper(light1);
    // scene.add(helper1);

    // GRID HELPER
    var size = 200;
    var divisions = 8;
    const gridHelper = new THREE.GridHelper(size, divisions);
    // helper.position.y = -70;
    scene.add(gridHelper);

    return scene;
};

const mkRenderer = (width, height, scene, camera) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => renderer.render(scene, camera));
    // invalidation.then(() => (controls.dispose(), renderer.dispose()));
    return renderer;
};

const mkCube = () => {
    const material = new THREE.MeshNormalMaterial();
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0;
    cube.position.x = 100;
    cube.position.z = 100;
    return cube;
};

const brainMaterial = new THREE.MeshPhongMaterial({
    color: "hsl(0,100%,100%)",
    opacity: 0.3,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
});

const atlasMaterial = new THREE.MeshPhongMaterial({
    color: "hsl(0,100%,50%)",
    opacity: 0.3,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
});

// const renderer = mkRenderer(
//     container.clientWidth,
//     container.clientWidth * 0.8,
//     scene,
//     camera
// );

const renderBrain = async () => {
    const dt = new Date().getTime();

    // Init scene
    const scene = mkScene();
    const cube = mkCube();
    scene.add(cube);

    // Init brain
    {
        const cells0 = [];
        await d3.csv("./atlas/cells-0.csv").then((raw) => {
            raw.map((e) => {
                cells0.push(e);
            });
        });

        const vertices0 = [];
        await d3.csv("./atlas/vertices-0.csv").then((raw) => {
            raw.map((e) => {
                vertices0.push(e);
            });
        });

        const model = mkBrainModel(cells0, vertices0);

        const vertices = mkVertices(model);

        const geometry = mkGeometry(vertices);
        geometry.translate(-45, -50 * 0, -45);

        const mesh = new THREE.Mesh(geometry, brainMaterial);
        scene.add(mesh);
    }

    // Init atlas
    {
        const cellsAll = [];
        await d3.csv("./atlas/cells-all.csv").then((raw) => {
            raw.map((e) => {
                cellsAll.push(e);
            });
        });

        const verticesAll = [];
        await d3.csv("./atlas/vertices-all.csv").then((raw) => {
            raw.map((e) => {
                verticesAll.push(e);
            });
        });

        const { name, idx } = getMainForm1();

        const model = mkBrainModel(cellsAll, verticesAll, idx);

        const vertices = mkVertices(model);

        const geometry = mkGeometry(vertices);
        geometry.translate(-45, -50 * 0, -45);

        const mesh = new THREE.Mesh(geometry, atlasMaterial);
        scene.add(mesh);
    }

    // Init spheres, the center of the brain areas, ata. the nodes.
    {
        const { displayNodes } = getMainForm1();
        if (displayNodes === "display-nodes") {
            await d3.csv("./atlas/atlas_table.csv").then((atlasTable) => {
                const table = atlasTable;

                const material = new THREE.MeshNormalMaterial();

                const mkSphere = (e) => {
                    const { x, y, z } = e;
                    const geometry = new THREE.SphereGeometry(1);
                    geometry.translate(-45, -50 * 0, -45);
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.x = parseInt(x);
                    sphere.position.y = parseInt(z);
                    sphere.position.z = parseInt(y);
                    return sphere;
                };

                const spheres = table.map(mkSphere);

                const group = new THREE.Group();

                spheres.map((e) => group.add(e));

                scene.add(group);
            });
        }
    }

    // Init renderer
    // 1. Display the ruler
    // 2. Get its size, width and height
    // 3. Use the size to render the scene
    const container = document.getElementById("three-container-1");
    const ruler = document.getElementById("three-container-1-ruler");
    ruler.__dt = dt;
    ruler.style = "display: block";
    const renderer = mkRenderer(
        container.clientWidth,
        (container.clientWidth * 9) / 16,
        scene,
        camera
    );
    {
        const divs = container.getElementsByTagName("div");
        for (let i = 0; i < divs.length; i++) {
            container.removeChild(divs[i]);
        }

        const canvas = container.getElementsByTagName("canvas");
        console.log(canvas);
        for (let i = 1; i < canvas.length; i++) {
            container.removeChild(canvas[i]);
        }
        container.appendChild(renderer.domElement);
        ruler.style = "display: none";

        renderer.render(scene, camera);
    }

    // const stats = new Stats();
    // stats.domElement.style.position = "absolute";
    // stats.domElement.style.left = container.offsetLeft + "px";
    // stats.domElement.style.top = container.offsetTop + "px";
    // container.appendChild(stats.domElement);

    const animate = () => {
        // stats.update();
        cube.rotation.z += 0.03;
        cube.rotation.y += 0.02;

        if (ruler.__dt === dt) {
            requestAnimationFrame(animate);
        } else {
            console.log("Request Animation Frame stops");
        }

        renderer.render(scene, camera);
    };
    animate();
};

window.addEventListener("resize", renderBrain);

// const onResize = () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// };

renderBrain();
