const canvas = document.getElementById("canvas-1");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const ctx = canvas.getContext("2d");

const points = [];

// Init 3 points randomly
function init() {
    while (points.length > 0) {
        points.pop();
    }

    const num = 3;
    for (let i = 0; i < num; i++) {
        const x = (i + 1) * 0.2 + math.random(0.1);
        const y = 0.2 + math.random(0.5);

        const offsetX = canvas.clientWidth * x,
            offsetY = canvas.clientHeight * y;

        points.push({ x: x, y: y, offsetX: offsetX, offsetY: offsetY });
    }
    redraw();
}

// Shuffle points
function shuffle() {
    for (const pnt of points) {
        const { x, y, offsetX } = pnt;
        const newY = 0.2 + math.random(0.5);
        const newOffsetY = canvas.clientHeight * newY;

        pnt.y = newY;
        pnt.offsetY = newOffsetY;
    }
    redraw();
}

init();

// Redraw the canvas
function redraw() {
    ctx.fillStyle = "#7a7374";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    compute();

    ctx.fillStyle = "#ed556a";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    for (const pnt of points) {
        const { offsetX, offsetY } = pnt;
        const radius = 5;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }
}

// Draw the Gaussian Processes Prediction
function drawPredict(values) {
    let firstPnt = undefined;

    // Draw the lower boundary trace
    firstPnt = true;
    ctx.strokeStyle = "#c3d7df";
    ctx.fillStyle = "#74787a";
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
        const { x, y, d } = values[i];
        const offsetX = x * canvas.clientWidth,
            offsetY = y * canvas.clientHeight,
            offsetH = d * canvas.clientHeight;
        if (firstPnt) {
            ctx.moveTo(offsetX, offsetY + offsetH);
            firstPnt = false;
        } else {
            ctx.lineTo(offsetX, offsetY + offsetH);
        }
    }

    for (let i = values.length - 1; i > -1; i -= 1) {
        const { x, y, d } = values[i];
        const offsetX = x * canvas.clientWidth,
            offsetY = y * canvas.clientHeight,
            offsetH = d * canvas.clientHeight;
        if (firstPnt) {
            ctx.moveTo(offsetX, offsetY - offsetH);
            firstPnt = false;
        } else {
            ctx.lineTo(offsetX, offsetY - offsetH);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw the prediction nodes
    for (const val of values) {
        const { x, y } = val;
        const offsetX = x * canvas.clientWidth,
            offsetY = y * canvas.clientHeight;

        ctx.fillStyle = "#eeb8c3";

        const radius = 2;
        ctx.beginPath();
        ctx.arc(offsetX, offsetY, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    // Draw the continue trace
    firstPnt = true;
    ctx.strokeStyle = "#eeb8c3";
    ctx.beginPath();
    for (const val of values) {
        const { x, y } = val;
        const offsetX = x * canvas.clientWidth,
            offsetY = y * canvas.clientHeight;
        if (firstPnt) {
            ctx.moveTo(offsetX, offsetY);
            firstPnt = false;
        } else {
            ctx.lineTo(offsetX, offsetY);
        }
    }
    ctx.stroke();
}

// Compute Gaussian Processes Prediction
function compute() {
    if (points.length < 3) return;

    const num = 100;
    const eps = 1e-6;

    let xi = new Array(num - 1).fill(1).map((item, index) => {
        return [index / (num - 1)];
    });
    xi.push([1.0]);

    const xf = points.map((e) => [e.x]);
    const yf = points.map((e) => [e.y]);

    const kff = gaussianKernel(xf, xf);
    const kyy = gaussianKernel(xi, xi);
    const kfy = gaussianKernel(xf, xi);
    const kffInv = math.inv(math.add(kff, eps));

    console.log(kff, kyy, kfy, kffInv);

    const mu = math.multiply(math.multiply(math.transpose(kfy), kffInv), yf);
    console.log(mu);

    const cov = math.subtract(
        kyy,
        math.multiply(math.multiply(math.transpose(kfy), kffInv), kfy)
    );
    console.log(cov);

    const values = [];
    for (let i = 0; i < num; i++) {
        const x = xi[i][0];
        const y = mu.subset(math.index(i, 0));
        const d = cov.subset(math.index(i, i)) ** 0.5;
        values.push({ x, y, d });
    }
    console.log(values);

    drawPredict(values);
}

canvas.addEventListener(
    "mousedown",
    (e) => {
        const { offsetX, offsetY } = e;
        const x = offsetX / canvas.clientWidth,
            y = offsetY / canvas.clientHeight;

        let newPnt = true;
        for (let pnt of points) {
            if (Math.abs(pnt.x - x) < 0.05) {
                pnt.y = y;
                pnt.offsetY = offsetY;
                newPnt = false;
            }
        }

        if (newPnt) {
            pnt = { offsetX: offsetX, offsetY: offsetY, x: x, y: y };
            points.push(pnt);
        }

        redraw();
    },
    false
);

window.addEventListener("resize", () => {
    console.log("Resize");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    init();
});
