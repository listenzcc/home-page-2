console.log("D3 version:", d3.version);

const parseKeyword = (name) => {
    let keyword = name.slice(0, -2);
    keyword = keyword.split(",")[0];
    keyword = keyword.split("(")[0];
    while (keyword.endsWith(" ")) {
        keyword = keyword.slice(0, -1);
    }
    keyword = keyword.replaceAll(" ", "-");
    keyword = keyword.toLowerCase();
    return keyword;
};

const inactiveGroup1 = () => {
    const lst = document.getElementsByClassName("active-group-1");
    for (const dom of lst) {
        dom.className = dom.className.replace(" active active-group-1", "");
    }
};

d3.csv("./atlas/atlas_table.csv").then((raw) => {
    console.log("Got brain atlas in .csv format:", raw.length);

    // Setup container
    d3.select("#atlas-table-1-container").attr("style", "max-height: 22em");

    // Setup thead
    const table = d3.select("#atlas-table-1");
    const thead = table.append("thead");
    thead
        .append("tr")
        .selectAll("th")
        .data(["#", "name", "x", "y", "z", "idx"])
        .enter()
        .append("th")
        .attr("scope", "col")
        .text((e) => e);

    // Setup tbody
    const tbody = table.append("tbody");
    const lines = tbody.selectAll("tr").data(raw).enter().append("tr");
    lines
        .selectAll("td")
        .data((e) => {
            return [e[""], e["name"], e["x"], e["y"], e["z"], e["idx"]];
        })
        .enter()
        .append("td")
        .text((e) => e);

    // Setup left panel
    const div1 = d3.select("#atlas-selector-side-container");
    div1.attr("style", "overflow-y: scroll; max-height:400px");
    div1.selectAll("li").data([]).exit().remove();
    div1.selectAll("li")
        .data(raw)
        .enter()
        .append("li")
        .attr("class", "nav-item")
        .append("a")
        .attr("class", "nav-link")
        .attr("href", "#")
        .append("span")
        .text((e) => e.name)
        .on("click", (event, e) => {
            console.log(e);
            setMainForm1(e);

            const target = event.target;

            console.log(target);

            inactiveGroup1();
            target.parentElement.className += " active active-group-1";

            const keyword = parseKeyword(e.name);
            document.getElementById("search-input-1").value = keyword;
            document.getElementById(
                "search-input-1-a"
            ).href = `https://radiopaedia.org/articles/${keyword}`;
        });
});

const setMainForm1 = (e) => {
    const { name, idx } = e ? e : { name: "", idx: "" };
    const form = document.getElementById("main-form-1");
    form.getElementsByTagName("input")["brain-area-idx"].value = idx;
    form.getElementsByTagName("input")["brain-area-name"].value = name;
    renderBrain();
};

const setMainForm1_options = () => {
    const form = document.getElementById("main-form-1");
    const optionDisplayNodes = document.getElementById("display-nodes-1");
    console.log(optionDisplayNodes.value);
    form.getElementsByTagName("input")["brain-area-display-nodes"].value =
        optionDisplayNodes.checked ? "display-nodes" : "";

    renderBrain();
};

const resetMainForm1 = () => {
    const form = document.getElementById("main-form-1");
    form.getElementsByTagName("input")["brain-area-idx"].value = "";
    form.getElementsByTagName("input")["brain-area-name"].value = "";
    renderBrain();
};

const getMainForm1 = () => {
    const form = document.getElementById("main-form-1");
    const idx = form.getElementsByTagName("input")["brain-area-idx"].value;
    const name = form.getElementsByTagName("input")["brain-area-name"].value;
    const displayNodes =
        form.getElementsByTagName("input")["brain-area-display-nodes"].value;
    return { name, idx, displayNodes };
};

// /* globals Chart:false, feather:false */

// (() => {
//     "use strict";

//     feather.replace({ "aria-hidden": "true" });

//     // Graphs
//     const ctx = document.getElementById("myChart");
//     // eslint-disable-next-line no-unused-vars
//     const myChart = new Chart(ctx, {
//         type: "line",
//         data: {
//             labels: [
//                 "Sunday",
//                 "Monday",
//                 "Tuesday",
//                 "Wednesday",
//                 "Thursday",
//                 "Friday",
//                 "Saturday",
//             ],
//             datasets: [
//                 {
//                     data: [15339, 21345, 18483, 24003, 23489, 24092, 12034],
//                     lineTension: 0,
//                     backgroundColor: "transparent",
//                     borderColor: "#007bff",
//                     borderWidth: 4,
//                     pointBackgroundColor: "#007bff",
//                 },
//             ],
//         },
//         options: {
//             scales: {
//                 yAxes: [
//                     {
//                         ticks: {
//                             beginAtZero: false,
//                         },
//                     },
//                 ],
//             },
//             legend: {
//                 display: false,
//             },
//         },
//     });
// })();
