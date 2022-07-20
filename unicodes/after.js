console.log("after.js is running");

function num2unicode(num) {
    const code = ("0000" + num.toString(16)).slice(-4);
    const uni = "U+" + code;
    const _uni = "\\u" + code;
    const unicode = eval('"' + _uni + '"');
    return { num, uni, unicode };
}

{
    const iframe = document.getElementById("iframe-1");
    const container = d3.select("#container-1");
    const previewContainer = d3.select("#preview-container");
    const fonts = [
        "u1400",
        "u1800",
        "u2800",
        "ufc00",
        "monospace",
        "fangsong",
        "serif",
        "emoji",
        "yolq",
    ];

    function preview(d) {
        console.log("Preview", d);
        iframe.src = "https://unicode-table.com/en/" + d.uni.slice(2);

        const data = fonts.map((f) => {
            const { unicode } = d;
            const font = f;
            return { unicode, font };
        });

        previewContainer.selectAll("section").data([]).exit().remove();

        const div = previewContainer
            .append("section")
            .append("div")
            .attr("class", "flex-container");

        const blocks = div
            .selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("style", "margin-left: 1em")
            .attr("class", "unicode-block");

        blocks
            .append("div")
            .text((d) => d.font)
            .attr("class", "unicode-code");
        blocks
            .append("div")
            .text((d) => d.unicode)
            .attr("style", (d) => "font-family: " + d.font)
            .attr("class", "unicode-character");
    }

    function onHexSelection() {
        const value = document.getElementById("input-1").value;
        const offset = value ? parseInt("0x" + value) : 0;

        const codes = [];
        const codesCount = 256;

        for (let i = 0; i < codesCount; i += 1) {
            codes.push(num2unicode(offset + i));
        }

        container.selectAll("section").data([]).exit().remove();

        const div = container
            .append("section")
            .append("div")
            .attr("class", "flex-container");

        const blocks = div
            .selectAll("div")
            .data(codes)
            .enter()
            .append("div")
            .attr("class", "unicode-block");

        {
            blocks.on("click", (e, d) => {
                preview(d);
            });
        }

        blocks
            .append("div")
            .text((d) => d.unicode)
            .attr("class", "unicode-character");

        blocks
            .append("div")
            .text((d) => d.uni)
            .attr("style", "font-family: u1400, u1800, u2800, ufc00")
            .attr("class", "unicode-code");

        var bool = true;
        blocks.attr("style", (d) => {
            if (bool) {
                bool = false;
                preview(d);
            }
            return "display: block";
        });
    }

    onHexSelection();

    {
        document.getElementById("input-1").onchange = onHexSelection;

        document.getElementById("input-1-btn-1").onclick = () => {
            const inp = document.getElementById("input-1");
            const value = inp.value;
            const src = value ? parseInt("0x" + value) : 0;
            const trg = src - 128 > 0 ? src - 128 : 0;
            inp.value = trg.toString(16);
            onHexSelection();
        };

        document.getElementById("input-1-btn-2").onclick = () => {
            const inp = document.getElementById("input-1");
            const value = inp.value;
            const src = value ? parseInt("0x" + value) : 0;
            const trg = src + 128;
            inp.value = trg.toString(16);
            onHexSelection();
        };

        const rnd = d3.randomInt(16 ** 4);

        document.getElementById("input-1-btn-3").onclick = () => {
            const inp = document.getElementById("input-1");
            const trg = rnd();
            inp.value = trg.toString(16);
            onHexSelection();
        };
    }
}
