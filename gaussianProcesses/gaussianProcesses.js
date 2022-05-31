// Compute the gaussian kernel value between two matrix
// The matrix are x1 and x2
// The first axis of the matrix is used
// The parameters is l and sigma
function gaussianKernel(x1, x2) {
    const l = document.getElementById("range-1")
        ? parseFloat(document.getElementById("range-1").value)
        : 1.0;

    const sigma = document.getElementById("range-2")
        ? parseFloat(document.getElementById("range-2").value)
        : 1.0;

    document.getElementById("range-1-label").innerHTML = "" + l;
    document.getElementById("range-2-label").innerHTML = "" + sigma;

    const kernel = math.zeros(x1.length, x2.length);

    const a = sigma ** 2;
    const c = -1 / 2 / l ** 2;

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

function norm2(x1, x2) {
    let n = 0;
    for (let i = 0; i < x1.length; i++) {
        n += (x1[i] - x2[i]) ** 2;
    }
    return n;
}
