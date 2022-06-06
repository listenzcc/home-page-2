console.log("Amazing code is running");

console.log("d3", d3, "d3.contours", d3.contours);

// Main data
d3.json("./geojson/subway.json").then(function (json) {
    console.log(json);

    // Remove 八通线
    // Remove 14号线西段
    json.l = json.l.filter((e, i) => i != 19 && i != 14);

    const box = { w: 500, e: -1, n: -1, s: 500 };

    const stationLongTable = new Object();

    const lines = json.l.map((e) => {
        const cl = e.cl;
        const name = e.kn;
        const num = e.st.length;
        const { lo } = e;

        const stations = e.st.map((e) => {
            const ch = e.n;
            const eng = e.sp;
            const { poiid } = e;
            const lon = parseFloat(e.sl.split(",")[0]),
                lat = parseFloat(e.sl.split(",")[1]);

            box.w = Math.min(lon, box.w);
            box.e = Math.max(lon, box.e);
            box.s = Math.min(lat, box.s);
            box.n = Math.max(lat, box.n);

            if (poiid in stationLongTable) {
                stationLongTable[poiid].line.push({ name, cl });
            } else {
                stationLongTable[poiid] = {
                    ch,
                    eng,
                    lon,
                    lat,
                    line: [{ name, cl }],
                };
            }

            return { ch, eng, lon, lat, poiid };
        });

        const boundary = []
            .concat(d3.extent(stations.map((e) => e.lon)))
            .concat(d3.extent(stations.map((e) => e.lat)));

        return { cl, name, num, stations, boundary, lo };
    });

    console.log(stationLongTable);

    console.log(box);

    console.log(lines);

    resetTable1(lines);

    resetUl1(box, lines, stationLongTable);

    drawCanvas(box, lines, stationLongTable);

    d3.select("#button-1").on("click", () => {
        drawDelaunay(box, lines, stationLongTable);
    });

    d3.select("#button-2").on("click", () => {
        drawDensity(box, lines, stationLongTable);
    });

    d3.select("#button-clear").on("click", () => {
        drawCanvas(box, lines, stationLongTable);
    });
});

// Density
function drawDensity(box, lines, stationLongTable) {
    const { ctx, scaleX, scaleY, scaleLon, scaleLat } = drawCanvas(
        box,
        lines,
        stationLongTable,
        "30"
    );

    const data = [];
    for (const poiid in stationLongTable) {
        const { ch, eng, lon, lat, line } = stationLongTable[poiid];
        data.push({ poiid, ch, lon, lat, line });
    }
    const delaunay = d3.Delaunay.from(
        data.map((d) => [scaleX(scaleLon(d.lon)), scaleY(scaleLat(d.lat))])
    );

    const voronoi = delaunay.voronoi([
        scaleX(0),
        scaleY(0),
        scaleX(1),
        scaleY(1),
    ]);

    for (let i = 0; i < data.length; i++) {
        const polygon = voronoi.cellPolygon(i);
        data[i].area = -1;
        if (!polygon) continue;
        data[i].area = Math.abs(d3.polygonArea(polygon));
    }

    const max = d3.max(data, (e) => e.area);
    data.map((e) => {
        e.area = e.area < 0 ? max : e.area;
    });
    const extent = d3.extent(data, (e) => e.area);
    const scaler = d3
        .scaleLog()
        .domain([1 / extent[1], 1 / extent[0]])
        .range([0.1, 1]);
    data.map((e) => {
        e.value = scaler(1 / e.area);
    });

    console.log(
        max,
        extent,
        data.map((e) => e.value)
    );

    console.log(data);

    for (let i = 0; i < data.length; i++) {
        // ctx.fillStyle = d3.interpolateCividis(data[i].value);
        ctx.fillStyle = d3.interpolateInferno(data[i].value);
        ctx.fillStyle += "80";
        const polygon = voronoi.cellPolygon(i);
        if (!polygon) continue;
        ctx.beginPath();
        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (let j = 1; j < polygon.length; j++) {
            ctx.lineTo(polygon[j][0], polygon[j][1]);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// Delaunay
function drawDelaunay(box, lines, stationLongTable) {
    const { ctx, scaleX, scaleY, scaleLon, scaleLat } = drawCanvas(
        box,
        lines,
        stationLongTable
    );

    const data = [];
    for (const poiid in stationLongTable) {
        const { ch, eng, lon, lat, line } = stationLongTable[poiid];
        data.push({ poiid, ch, lon, lat, line });
    }
    const delaunay = d3.Delaunay.from(
        data.map((d) => [scaleX(scaleLon(d.lon)), scaleY(scaleLat(d.lat))])
    );

    const voronoi = delaunay.voronoi([
        scaleX(0),
        scaleY(0),
        scaleX(1),
        scaleY(1),
    ]);

    for (let i = 0; i < data.length; i++) {
        ctx.fillStyle = `#${data[i].line[0].cl}50`;
        const polygon = voronoi.cellPolygon(i);
        if (!polygon) continue;
        ctx.beginPath();
        ctx.moveTo(polygon[0][0], polygon[0][1]);
        for (let j = 1; j < polygon.length; j++) {
            ctx.lineTo(polygon[j][0], polygon[j][1]);
        }
        ctx.closePath();
        ctx.fill();
    }

    // ctx.beginPath();
    // delaunay.render(ctx);
    // ctx.strokeStyle = "#ffcccc50";
    // ctx.stroke();

    ctx.beginPath();
    voronoi.render(ctx);
    voronoi.renderBounds(ctx);
    ctx.strokeStyle = "#cccccca0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // ctx.beginPath();
    // delaunay.renderPoints(ctx);
    // ctx.fill();
}

// Reset Ul1
function resetUl1(box, lines, stationLongTable) {
    const data = [];
    for (const poiid in stationLongTable) {
        const { ch, eng, lon, lat, line } = stationLongTable[poiid];
        data.push({ poiid, ch, lon, lat, line });
    }

    d3.select("#ul-1").selectAll("li").data([]).exit().remove();

    const links = d3
        .select("#ul-1")
        .selectAll("li")
        .data(data)
        .enter()
        .append("li")
        .attr("class", "nav-item")
        .attr("style", (e) => "background-color: #" + e.line[0].cl + "40")
        .append("a")
        .attr("class", "nav-link")
        .attr("aria-current", "page")
        .text(
            (e) => e.ch + ` - ${e.line.length} - ` + e.line.map((d) => d.name)
        )
        // .attr("style", (e) => "color: white")
        .on("click", (event, e) => {
            links.attr("class", "nav-link");
            d3.select(event.target).attr("class", "nav-link active");
            console.log("Click:", e);
            onSelectStation(e, box, lines, stationLongTable);
        });
}

function onSelectStation(st, box, lines, stationLongTable) {
    const { poiid, ch, lon, lat } = st;

    const { ctx, scaleX, scaleY, scaleLon, scaleLat } = drawCanvas(
        box,
        lines,
        stationLongTable
    );

    const x = scaleX(scaleLon(lon)),
        y = scaleY(scaleLat(lat));

    ctx.strokeStyle = "#ff0000";
    ctx.fillStyle = "#00000000";
    drawCircle(ctx, x, y, 10);
}

// Draw circle
function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}

// Draw canvas
function drawCanvas(box, lines, stationLongTable, alpha = "80") {
    const canvas = document.getElementById("canvas-1");
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = (canvas.width / (box.e - box.w)) * (box.n - box.s);

    const scaleX = d3.scaleLinear().domain([0, 1]).range([0, canvas.width]);
    const scaleY = d3.scaleLinear().domain([0, 1]).range([0, canvas.height]);

    const scaleLon = d3.scaleLinear().domain([box.w, box.e]).range([0.1, 0.9]);
    const scaleLat = d3.scaleLinear().domain([box.n, box.s]).range([0.1, 0.9]);

    ctx.fillStyle = "#e2e1e4";
    ctx.fillRect(scaleX(0.0), scaleY(0.0), scaleX(1.0), scaleY(1.0));

    // Draw lines
    for (const line of lines) {
        let firstPnt = true;
        ctx.strokeStyle = "#" + line.cl + alpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (const st of line.stations) {
            const x = scaleX(scaleLon(st.lon)),
                y = scaleY(scaleLat(st.lat));

            if (firstPnt) {
                ctx.moveTo(x, y);
                firstPnt = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        if (line.lo == 1) {
            console.log("loop", line);
            ctx.closePath();
        }
        ctx.stroke();
    }

    // Draw stations
    for (const line of lines) {
        for (const st of line.stations) {
            const x = scaleX(scaleLon(st.lon)),
                y = scaleY(scaleLat(st.lat)),
                poiid = st.poiid;

            ctx.fillStyle = "#" + line.cl + alpha;
            if (stationLongTable[poiid].line.length > 1) {
                ctx.strokeStyle = "#000000" + alpha;
            } else {
                ctx.strokeStyle = "#ffffff" + alpha;
            }
            ctx.lineWidth = 2;
            drawCircle(ctx, x, y, canvas.width / 300);
        }
    }

    return { ctx, scaleX, scaleY, scaleLon, scaleLat };
}

// Reset table-1
function resetTable1(lines) {
    const container = d3.select("#table-1-container");
    container.selectAll("table").data([]).exit().remove();

    const table1 = container
        .append("table")
        .attr("class", "table table-striped table-sm");

    table1
        .append("thead")
        .append("tr")
        .selectAll("th")
        .data(["#", "Line", "Stations"])
        .enter()
        .append("th")
        .attr("scope", "col")
        .text((e) => e);

    table1
        .append("tbody")
        .selectAll("tr")
        .data(lines)
        .enter()
        .append("tr")
        .selectAll("td")
        .data((e) => {
            return [
                { value: e.cl, color: "#" + e.cl },
                { value: e.name, color: "#" + e.cl },
                { value: e.num, color: "#" + e.cl },
            ];
        })
        .enter()
        .append("td")
        .attr("style", (e) => "color: " + e.color)
        .text((e) => e.value);
}
