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
            console.log(event, e);
            d3.select("#main-iframe-1").attr(
                "src",
                "./book/" + baseName(e.FullName)
            );

            a.attr("class", (_, i) => {
                return i == e.idx ? "nav-link active" : "nav-link";
            });
        });

    a.append("span")
        .attr("class", "align-text-bottom")
        .attr("data-feather", "home")
        .text((e) => baseName(e.FullName));
});
