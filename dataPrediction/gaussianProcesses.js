// Gaussian Processes Prediction
// Sample function: y = f(x)
// Prediction function: ? = f(t)
function gaussianProcesses(x, y, t) {
    const eps = 0 * 1e-6;

    const phi = document.getElementById("range-1")
        ? parseFloat(document.getElementById("range-1").value)
        : 1.2;

    const sigma = document.getElementById("range-2")
        ? parseFloat(document.getElementById("range-2").value)
        : 1.6;

    // const phi = 0.5,
    //     sigma = 1;

    const kff = gaussianKernel(t, t, phi, sigma);
    const kyy = gaussianKernel(x, x, phi, sigma);
    const kyf = gaussianKernel(x, t, phi, sigma);
    const kyyInv = math.inv(math.add(kyy, eps));

    const mu = math.multiply(math.multiply(math.transpose(kyf), kyyInv), y);

    const cov = math.subtract(
        kff,
        math.multiply(math.multiply(math.transpose(kyf), kyyInv), kyf)
    );

    console.log(x, y, t, kff, kyy, kyf, kyyInv, mu, cov);

    return { mu, cov };
}

// Compute the gaussian kernel value between two matrix
// The matrix are x1 and x2
// The first axis of the matrix is used
// The parameters is l and sigma
function gaussianKernel(x1, x2, phi, sigma) {
    const kernel = math.zeros(x1.length, x2.length);

    const a = sigma ** 2;
    const c = -1 / 2 / phi ** 2;

    for (let i = 0; i < x1.length; i++) {
        for (let j = 0; j < x2.length; j++) {
            kernel.subset(
                math.index(i, j),
                a * math.exp(c * norm2(x1[i], x2[j]))
            );
        }
    }

    return kernel;
}

// Compute the norm2 of x1 - x2
function norm2(x1, x2) {
    let n = 0;
    for (let i = 0; i < x1.length; i++) {
        n += (x1[i] - x2[i]) ** 2;
    }
    return n;
}
