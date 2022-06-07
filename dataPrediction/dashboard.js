console.log("d3 for general usage", d3);
console.log("math for matrix computation", math);
console.log("Plotly for plotting", Plotly);

d3.csv("./asset/lfp-sex-race-hispanic.csv").then((raw) => {
    console.log("raw", raw);

    const colorTable = {
        all: d3.schemeCategory10[0],
        white: d3.schemeCategory10[1],
        black: d3.schemeCategory10[2],
        hispanic: d3.schemeCategory10[3],
        asian: d3.schemeCategory10[4],
    };

    function _get(e, name) {
        const { year } = e;
        const color = colorTable[name];
        const x = parseFloat(year),
            m = parseFloat(e[name + " men"]) / 100,
            w = parseFloat(e[name + " women"]) / 100;
        return { x, m, w, name, color };
    }

    const all = raw
        .filter((e) => e["all women"].length > 0)
        .map((e) => _get(e, "all"));

    const white = raw
        .filter((e) => e["white women"].length > 0)
        .map((e) => _get(e, "white"));

    const black = raw
        .filter((e) => e["black women"].length > 0)
        .map((e) => _get(e, "black"));

    const hispanic = raw
        .filter((e) => e["hispanic women"].length > 0)
        .map((e) => _get(e, "hispanic"));

    const asian = raw
        .filter((e) => e["asian women"].length > 0)
        .map((e) => _get(e, "asian"));

    const data = { all, white, black, hispanic, asian };

    console.log("data", data);

    function reCompute() {
        const targetName = document.getElementById("selection-1").value;
        const targetSex = document.getElementById("selection-2").value;
        document.getElementById("range-1-label").innerHTML =
            document.getElementById("range-1").value;
        document.getElementById("range-2-label").innerHTML =
            document.getElementById("range-2").value;
        compute(data, targetName, targetSex);
    }

    drawData(data);
    reCompute();

    window.onresize = () => {
        drawData(data);
        reCompute();
    };

    d3.select("#selection-1").on("change", () => {
        reCompute();
    });

    d3.select("#selection-2").on("change", () => {
        reCompute();
    });

    d3.select("#range-1").on("input", reCompute);
    d3.select("#range-2").on("input", reCompute);
});

function compute(data, targetName = "asian", targetSex = "w") {
    const { all, white, black, hispanic, asian } = data;

    eval(`var target = ${targetName}`);

    console.log("target", target);

    const scaler = d3.scaleLinear().domain([1948, 2020]).range([0, 1]);
    // const scaler = d3.scaleLinear().domain([0, 1]).range([0, 1]);

    const t = all.map((e) => {
        eval(`var v = e.${targetSex}`);
        return [scaler(e.x), v];
    });

    const _all = all.slice(-target.length);

    const x = target
        .map((e, i) => {
            eval(`var v = _all[i].${targetSex}`);
            return [scaler(e.x), v];
        })
        .filter((e, i) => false || i % 10 === 0);

    const y = target
        .map((e) => {
            eval(`var v = e.${targetSex}`);
            return [v];
        })
        .filter((e, i) => false || i % 10 === 0);

    const p = gaussianProcesses(x, y, t);

    function _trace(color) {
        const name = targetName + "-prediction";
        const y = [];
        for (let i = 0; i < p.mu.size()[0]; i++) {
            y.push(p.mu.subset(math.index(i, 0)));
        }
        const x = all.map((e) => e.x);
        const mode = "lines",
            line = { color, dash: "dashdot" },
            type = "scatter";
        return { x, y, type, mode, line, name };
    }

    function _traceUpper(color) {
        const name = targetName + "-upper";
        const y = [];
        for (let i = 0; i < p.mu.size()[0]; i++) {
            y.push(
                p.mu.subset(math.index(i, 0)) + p.cov.subset(math.index(i, i))
            );
        }
        const x = all.map((e) => e.x);
        const mode = "lines",
            line = { color: color + "50" },
            showlegend = false;
        type = "scatter";
        return { x, y, type, mode, line, showlegend, name };
    }

    function _traceLower(color) {
        const name = targetName + "-lower";
        const y = [];
        for (let i = 0; i < p.mu.size()[0]; i++) {
            y.push(
                p.mu.subset(math.index(i, 0)) - p.cov.subset(math.index(i, i))
            );
        }

        const x = all.map((e) => e.x);
        const mode = "lines",
            line = { color: color + "50" },
            showlegend = false,
            type = "scatter";
        return { x, y, type, mode, line, showlegend, name };
    }

    function _trace_sex(e) {
        const name = e[0].name + "-" + targetSex;
        const color = "#000000"; //e[0].color;
        const x = e.map((e) => e.x),
            y = e.map((e) => {
                eval(`var v = e.${targetSex}`);
                return v;
            }),
            mode = "lines",
            line = { color },
            type = "scatter";

        return { x, y, type, mode, line, name };
    }

    const layout3 = {
        title: "Labor Force Percentage (Prediction)",
        showlegend: true,
        legend: {
            orientation:
                document.getElementById("myDiv-3").offsetWidth > 800
                    ? "v"
                    : "h",
        },
    };

    const trace3 = [
        _trace(target[0].color),
        _traceUpper(target[0].color),
        _traceLower(target[0].color),
        _trace_sex(target),
    ];

    Plotly.newPlot("myDiv-3", trace3, layout3);
}

function drawData(data) {
    const { all, white, black, hispanic, asian } = data;

    function _trace_men(e) {
        const name = e[0].name + "-m";
        const color = e[0].color;
        const x = e.map((e) => e.x),
            y = e.map((e) => e.m),
            mode = "lines",
            line = { color, dash: "dashdot" },
            legendgroup = "men",
            type = "scatter";
        return { x, y, type, mode, line, legendgroup, name };
    }

    function _trace_women(e) {
        const name = e[0].name + "-w";
        const color = e[0].color;
        const x = e.map((e) => e.x),
            y = e.map((e) => e.w),
            mode = "lines",
            line = { color },
            legendgroup = "women",
            type = "scatter";
        return { x, y, type, mode, line, legendgroup, name };
    }

    function _trace_avg(e) {
        const color = e[0].color,
            name = "avg-" + e[0].name,
            x = e.map((e) => e.x),
            y = e.map((e) => (e.w + e.m) / 2),
            mode = "lines",
            line = { color },
            type = "scatter";

        return { x, y, type, mode, line, name };
    }
    const layout1 = {
        title: "Labor Force Percentage (Sex)",
        showlegend: true,
        legend: {
            orientation:
                document.getElementById("myDiv-1").offsetWidth > 800
                    ? "v"
                    : "h",
        },
    };

    const trace1 = [
        _trace_men(all),
        _trace_men(white),
        _trace_men(black),
        _trace_men(hispanic),
        _trace_men(asian),
        _trace_women(all),
        _trace_women(white),
        _trace_women(black),
        _trace_women(hispanic),
        _trace_women(asian),
    ];

    Plotly.newPlot("myDiv-1", trace1, layout1);

    const layout2 = {
        title: "Labor Force Percentage (Avg)",
        showlegend: true,
        legend: {
            orientation:
                document.getElementById("myDiv-1").offsetWidth > 800
                    ? "v"
                    : "h",
        },
    };
    const trace2 = [
        _trace_avg(all),
        _trace_avg(white),
        _trace_avg(black),
        _trace_avg(hispanic),
        _trace_avg(asian),
    ];
    Plotly.newPlot("myDiv-2", trace2, layout2);
}
