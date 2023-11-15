// constants
const features = ["Age", "Edlevel"];
const numerical = [];
const categorical = []

const csv_link = "";

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

function load(feat) {
    let new_data = []
    if (numerical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

        }).catch(err => console.log(err));
    } else if (categorical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

            data.forEach()

        }).catch(err => console.log(err));
    } else {

    }
}

function load_barchart(data) {
    let chart = document.getElementById("bar-histo-chart")
    chart.innerHTML = "";

    let width = 300;
    let height = 300;

    let svg = d3.select("#bar-histo-chart")
        .attr("width", width)
        .attr("height", height)

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    // Bind data to SVG rectangles
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value));

    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));
}

window.addEventListener("load", () => {
    load_dropdown();
    load_barchart([{
        label: "USA",
        value: 200
    }, {
        label: "Other",
        value: 300
    }]);
})