// constants
features = ["Age", "Edlevel"];

function load_dropdown() {
    dropdown = document.getElementById("dropdown-content");
    features.forEach(feat => {
        let a = document.createElement("a");
        a.href = "#";
        a.classList.add("dropdown-item");
        a.innerHTML = feat;
        dropdown.appendChild(a);
    })
}

function load_barchart(data) {
    let chart = document.getElementById("bar-histo-chart")
    chart.innerHTML = "";

    d3.select("#bar-histo-chart").selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .attr("class", "bar")
        .style("height", d => d + "px")
}

window.addEventListener("load", () => {
    load_dropdown();
    load_barchart([5, 10, 15, 20, 25]);
})