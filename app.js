// constants
const features = ["Age","EdLevel","Employment","Gender","MainBranch","YearsCode","YearsCodePro","Country","PreviousSalary","ComputerSkills"];
const numerical = ["YearsCode","YearsCodePro", "PreviousSalary","ComputerSkills"];
const categorical = ["Age","EdLevel","Employment","Gender","MainBranch","Country"];

const x_label_map = {
    "YearsCode": "Years",
    "YearsCodePro": "Years",
    "PreviousSalary": "USD",
    "ComputerSkills": "Number of Skills"
};

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
    let chart = document.getElementById("bar-histo-chart")
    chart.innerHTML = "";

    let new_data = [];
    if (numerical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

            console.log(data);
            data.forEach(entry => {
                new_data.push(entry[feat])
            })
            load_histogram(new_data, feat);

        }).catch(err => console.log(err));
    } else if (categorical.indexOf(feat) !== -1) {
        d3.csv(csv_link).then(data => {

            // parse data into list of {label, value (frequency)}
            let freqs = get_frequencies(data, feat);
            Object.keys(freqs).forEach(key => new_data.push({label: key, value: freqs[key]}));
            load_barchart(new_data, feat);
            

        }).catch(err => console.log(err));
    } else {

    }
}

function load_barchart(data, feat) {

    let width = 300;
    let height = 300;

    let svg = d3.select("#bar-histo-chart")
        .attr("width", width)
        .attr("height", height)

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width])
        .padding(.1)

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    // Bind data to SVG rectangles
    let bars = svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value))
        .attr("fill", "steelblue")
        .on("click", handleClick)

        function handleClick (d, i) {
            // Toggle color on click
            const currentColor = d3.select(this).attr("fill");
            const newColor = currentColor === "steelblue" ? "red" : "steelblue";
            d3.selectAll("rect").attr("fill", "steelblue");
            d3.select(this).attr("fill", newColor);
        }

    // Add x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text") // rotate x-axis labels
        .attr("transform", "rotate(-90)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("text-anchor", "end");

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));


    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 75)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Applicants");

    // Add title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - 50)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(feat);
}

/**
 * This function expects an array of numerical values and displays the histogram
 * in the section where a histogram/bar chart would go normally
 * @param data 
 */
function load_histogram(data, feat) {
    // Define dimensions
    const width = 400;
    const height = 400;
    const margin = {top: 20, right: 30, bottom: 30, left: 80};
    const inWidth = width - margin.left - margin.right;
    const inHeight = height - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("#bar-histo-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create histogram function
    const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(data))
        .thresholds(10);

    // Generate histogram bins
    const bins = histogram(data);

    // Create x scale
    const x = d3.scaleLinear()
        .domain([d3.min(data), d3.max(data)])
        .range([0, inWidth]);

    // Create y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([inHeight, 0]);

    // Create bars
    svg.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    // Create x-axis
    svg.append("g")
        .attr("transform", `translate(0,${inHeight})`)
        .call(d3.axisBottom(x));

    // Create y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Append a 'text' element for the title
    svg.append("text")
    .attr("x", (width / 2) - margin.left)
    .attr("y", -margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "20px") 
    .text(feat);   

    // Append a 'text' element for the x-axis label
    svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top/2})`)  // Position below the x-axis
    .style("text-anchor", "middle")  // Center the text horizontally
    .text(x_label_map[feat]);           // Replace with your desired label

    // Append a 'text' element for the y-axis label
    svg.append("text")
        .attr("transform", `rotate(-90)`) 
        .attr("y", -margin.left)        
        .attr("x", 0 - (height / 2))       
        .attr("dy", "1em")                
        .style("text-anchor", "middle")    
        .text("Number of Applicants");  
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
})