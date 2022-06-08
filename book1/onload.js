const myPdf = {
    url: "./book/CHAPTER-I---FUNDAMENTALS_1964_Mathematical-Theory-of-Probability-and-Statist.pdf",
    pageIdx: 1,
};

d3.csv("./index.csv").then((raw) => {
    raw.map((e, i) => (e.idx = i));
    console.log(raw);

    // <ul class="nav flex-column">
    //     <li class="nav-item">
    //         <a class="nav-link active" aria-current="page" href="#">
    //             <span data-feather="home" class="align-text-bottom"></span>
    //             Dashboard
    //         </a>
    //     </li>

    function baseName(fullName) {
        return fullName.split("\\").pop();
    }

    const container = d3.select("#left-panel-1").select("ul");

    container.selectAll("li").data([]).exit().remove();

    const li = container
        .selectAll("li")
        .data(raw)
        .enter()
        .append("li")
        .attr("href", "#")
        .attr("class", (e, i) => {
            return i == 0 ? "nav-item" : "nav-item";
        });

    const a = li
        .append("a")
        .attr("class", (e, i) => {
            return i == 0 ? "nav-link active" : "nav-link";
        })
        .attr("aria-current", "page")
        .on("click", (event, e) => {
            console.log(e.idx, e, event, baseName(e.FullName));
            const url = "./book/" + baseName(e.FullName);

            myPdf.url = url;

            d3.select("#main-iframe-1").attr("src", url);
            document.getElementById("range-2").value = 1;
            document.getElementById("range-2-label").innerHTML =
                url + " Page: 1";
            renderNewPdf();

            a.attr("class", (_, i) => {
                return i == e.idx ? "nav-link active" : "nav-link";
            });
        });

    a.append("span")
        .attr("class", "align-text-bottom")
        .attr("data-feather", "home")
        .text((e) => baseName(e.FullName));
});

function changePageIdx() {
    const pageIdx = parseInt(document.getElementById("range-2").value);
    document.getElementById("range-2-label").innerHTML =
        myPdf.url + " Page: " + pageIdx;

    myPdf.pageIdx = pageIdx;
    renderNewPdf();
}

function renderNewPdf() {
    const { url, pageIdx } = myPdf;
    console.log(url, pageIdx);

    var loadingTask = pdfjsLib.getDocument(url);

    loadingTask.promise.then(function (pdf) {
        // you can now use *pdf* here
        document.getElementById("range-2").max = pdf.numPages;

        pdf.getPage(pageIdx).then(function (page) {
            var canvas = document.getElementById("canvas-1");
            var context = canvas.getContext("2d");

            // you can now use *page* here
            var scale = 1.0;
            var viewport = page.getViewport({ scale: scale });

            // Rescale the pdf to fit the width of the canvas
            scale =
                Math.max(canvas.parentElement.clientWidth, 300) /
                viewport.width;

            viewport = page.getViewport({ scale: scale });

            // Support HiDPI-screens.
            var outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            var transform =
                outputScale !== 1
                    ? [outputScale, 0, 0, outputScale, 0, 0]
                    : null;

            var renderContext = {
                canvasContext: context,
                transform: transform,
                viewport: viewport,
            };
            page.render(renderContext);
        });
    });
}

renderNewPdf();
