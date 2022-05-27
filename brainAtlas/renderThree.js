console.log("THREE.js:", THREE);

const normals = angleNormals;

const mkBrainModel = (_cells, _vertices) => {
    const cells = _cells.map((e) => [
        parseInt(e.v2),
        parseInt(e.v1),
        parseInt(e.v0),
    ]);

    const positions = _vertices.map((e) => [
        parseFloat(e.z),
        parseFloat(e.x),
        parseFloat(e.y),
    ]);

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

const mkCamera = (aspect) => {
    const fov = 45;
    //   const aspect = width / height;
    const near = 1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(150, 200, -150);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
};

const scene = (() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001b42);
    return scene;
})();

const cube = (() => {
    const material = new THREE.MeshNormalMaterial();
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0;
    cube.position.x = 100;
    cube.position.z = 100;
    return cube;
})();

{
    let color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);

    scene.add(light);

    color = 0x00ff00;
    const light1 = new THREE.SpotLight(color);
    light1.position.y = 100;
    scene.add(light1);

    // const helper1 = new THREE.SpotLightHelper(light1);
    // scene.add(helper1);

    scene.add(cube);

    // GRID HELPER
    var size = 200;
    var divisions = 8;
    const gridHelper = new THREE.GridHelper(size, divisions);
    // helper.position.y = -70;
    scene.add(gridHelper);
}

const mkRenderer = (width, height, camera) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(devicePixelRatio);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", () => renderer.render(scene, camera));
    // invalidation.then(() => (controls.dispose(), renderer.dispose()));
    return renderer;
};

const render = async () => {
    //
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

    const brainModel = mkBrainModel(cells0, vertices0);

    const vertices = mkVertices(brainModel);

    const brainGeometry = mkGeometry(vertices);
    brainGeometry.translate(-45, -50 * 0, -45);

    const material = new THREE.MeshPhongMaterial({
        color: "hsl(0,100%,100%)",
        opacity: 0.3,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(brainGeometry, material);
    scene.add(mesh);

    //
    const ruler = document.getElementById("three-container-1-ruler");
    ruler.style = "display: block";

    const container = document.getElementById("three-container-1");
    const camera = mkCamera(container.clientWidth / container.clientHeight);
    const renderer = mkRenderer(
        container.clientWidth,
        container.clientHeight,
        camera
    );

    ruler.style = "display: none";

    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);

    const animate = () => {
        cube.rotation.z += 0.03;
        cube.rotation.y += 0.02;

        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    };
    animate();
};

render();
