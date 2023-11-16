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

const pca_link = "./job_data_with_pca.csv";

const csv_link = "./job_data_cleaned.csv";

const components = [[ 0.76894418,  0.00749362],
                    [ 0.63907601,  0.01581817],
                    [ 0.00737753,  0.00129409],
                    [-0.01588319,  0.99984597]];

const currentFeat = "Age";

function handleClick (event, d) {
    // Toggle color on click
    const currentColor = d3.select(this).attr("fill");
    const newColor = currentColor === "steelblue" ? "red" : "steelblue";

    // reset all bars
    d3.selectAll("rect").attr("fill", "steelblue");

    // change current bar to newColor
    d3.select(this).attr("fill", newColor);

    // change biplot points
    let points = d3.select("#biplot").selectAll("circle")
    points.filter(point => console.log(point))
}

function load_dropdown() {
    dropdown = document.getElementById("dropdown-content");
    features.forEach(feat => {
        let a = document.createElement("a");
        a.href = "#";
        a.classList.add("dropdown-item");
        a.innerHTML = feat;
        a.addEventListener("click", () => {currentFeat = feat; load(feat)});
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

function load_biplot() {

    const pca_labels = ["YearsCode", "YearsCodePro", "PreviousSalary", "ComputerSkills"]

    function biplot(data) {
        // Set up chart dimensions
        const width = 400;
        const height = 400;
        const svgHeight = height - 50;
        const svgWidth = width - 50;

        // Create SVG container
        const svg = d3.select("#biplot")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        // Create scales for mapping data to visual representation
        const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
            .range([0, svgWidth]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
            .range([svgHeight, 0]);

        // Draw data points
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("currentFeat", currentFeat)
            .attr("cx", d => xScale(d[0]))
            .attr("cy", d => yScale(d[1]))
            .attr("r", 3)
            .attr("fill", "steelblue");

        // Create x-axis
        svg.append("g")
            .attr("transform", `translate(0,${svgHeight})`)
            .call(d3.axisBottom(xScale));

        // Create y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Append a 'text' element for the title
        svg.append("text")
            .attr("x", (svgWidth / 2))
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "20px") 
            .text("Biplot");   

        // Append a 'text' element for the x-axis label
        svg.append("text")
            .attr("transform", `translate(${svgWidth / 2},${svgHeight})`)  // Position below the x-axis
            .style("text-anchor", "middle")  // Center the text horizontally
            .text("PC1");           // Replace with your desired label

        // Append a 'text' element for the y-axis label
        svg.append("text")
            .attr("transform", `rotate(-90)`) 
            .attr("y", 0)        
            .attr("x", 0 - (svgHeight / 2))       
            .attr("dy", "1em")                
            .style("text-anchor", "middle")    
            .text("PC2");  

        // Draw arrows for the features
        for (let i = 0; i < components.length; i++) {
            // Arrow
            svg.append("line")
                .attr("x1", svgWidth / 2)
                .attr("y1", svgHeight / 2)
                .attr("x2", svgWidth / 2 + components[i][0] * 200) // Adjust the scale factor as needed
                .attr("y2", svgHeight / 2 + components[i][1] * 200) // Adjust the scale factor as needed
                .attr("stroke", "purple")
                .attr("marker-end", "url(#arrowhead)");

            // Text label
            svg.append("text")
                .attr("x", svgWidth / 2 + components[i][0] * 150) // Adjust the scale factor as needed
                .attr("y", svgHeight / 2 + components[i][1] * 150) // Adjust the scale factor as needed
                .text(pca_labels[i])
                .attr("fill", "darkblue")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle");
        }

        // Add arrowhead marker definition
        svg.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("refX", 6)
            .attr("refY", 3)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L6,3 L0,6 Z")
            .attr("fill", "purple");
        }

    d3.csv(pca_link).then(data => {

        let new_data = [];
        data.forEach(entry => {
            new_data.push([entry["PC1"], entry["PC2"], entry[currentFeat]])
        })
        biplot(new_data.slice(400, 800));

    }).catch(err => console.log(err));
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
        .attr("height", d => y(0) - y(d.length))
        .attr("fill", "steelblue")
        .on("click", handleClick);

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
    load(currentFeat);
    load_biplot();
})