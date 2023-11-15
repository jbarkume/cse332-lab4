// constants
const features = ["Age","EdLevel","Employment","Gender","MainBranch","YearsCode","YearsCodePro","Country","PreviousSalary","ComputerSkills"];
const numerical = ["YearsCode","YearsCodePro", "PreviousSalary","ComputerSkills"];
const categorical = ["Age","EdLevel","Employment","Gender","MainBranch","Country"]

const csv_link = "./job_data_cleaned.csv";

function load_dropdown() {
    dropdown = document.getElementById("dropdown-content");
    features.forEach(feat => {
        let a = document.createElement("a");
        a.href = "#";
        a.classList.add("dropdown-item");
        a.innerHTML = feat;
        a.addEventListener("click", () => load(feat));
        dropdown.appendChild(a);
    })
}

function load(feat) {
    let new_data = []
    if (numerical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

            console.log(data);

        }).catch(err => console.log(err));
    } else if (categorical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

            // parse data into list of {label, value (frequency)}
            let freqs = get_frequencies(data, feat);
            Object.keys(freqs).forEach(key => new_data.push({label: key, value: freqs[key]}));
            load_barchart(new_data);
            

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

/**
 * Given the array data, returns a dictionary of frequencies in the form of {label: value}
 */
function get_frequencies(data, feat_name) {
    let freqs = {};
    data.forEach(entry => {
        if (freqs[entry[feat_name]])
            freqs[entry[feat_name]]++;
        else
            freqs[entry[feat_name]] = 1;
    })
    return freqs;
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