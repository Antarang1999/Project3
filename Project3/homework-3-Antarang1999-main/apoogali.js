
var selectedValues = [];
var beeswarmData,filteredData,circles,svg, year,boxplotattr;
let xScale,xAxis,margin,width,height,xDropdown,tooltip;


const regionColors = {
  "East Asia & Pacific": "lightblue",
  "Europe & Central Asia": "gold",
  "Latin America & Caribbean": "violet",
  "Middle East & North Africa": "purple",
  "South Asia": "orange",
  "Sub-Saharan Africa": "lightcoral",
  "North America": "red"
};


const colorScale = d3.scaleOrdinal()
  .domain(Object.keys(regionColors))
  .range(Object.values(regionColors));

$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
    $(this).closest("li").toggleClass("active", this.checked);
 });
 
 $(document).on('click', '.allow-focus', function (e) {

  
  var selectedCheckbox = $(this).closest('.dropdown-menu').find('input[type="checkbox"]:checked');

  selectedValues = [];
  selectedCheckbox.each(function() {
    selectedValues.push($(this).val());
  });

  console.log('Selected values from the dropdown:', selectedValues);
  var selectedXAxis = $("#x-axis-dropdown").val(); 
  var selectedBoxPlotAttr = $("#boxplot").val(); 

  updateBeeswarm(selectedValues, selectedXAxis, year);
  updateBoxPlot(beeswarmData,selectedValues,selectedBoxPlotAttr,year)
  e.stopPropagation();
 });


 document.addEventListener('DOMContentLoaded', function () {
    const selectAllButton = document.getElementById('select-all');
    const deselectAllButton = document.getElementById('deselect-all');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    xDropdown = document.getElementById("x-axis-dropdown");
    const sizeDropdown = document.getElementById("size");
    boxplotattr = document.getElementById("boxplot");
    year = document.getElementById('year').value;

    selectAllButton.addEventListener('click', function () {
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = true;
      });
    });

    deselectAllButton.addEventListener('click', function () {
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = false;
      });
    });
 
    const yearInput = document.getElementById('year');
    const playButton = document.getElementById('play');
    let isPlaying = false;


    playButton.addEventListener('click', function () {
      isPlaying = !isPlaying;
      const enteredYear = parseInt(yearInput.value, 10);
      if (enteredYear < 1980 || enteredYear > 2013) {
        yearInputError.textContent = "Year must be between 1980 and 2013!";
        yearInput.setCustomValidity("Invalid year");
      }
      
      else if (selectedValues.length === 0) {
        yearInputError.textContent = " Please select a region to continue!";
          
        }
        
      else{
        yearInputError.textContent = "";
        yearInput.setCustomValidity("");
     
        if (isPlaying) {
          playButton.textContent = 'Pause';
          intervalId = setInterval(incrementYear, 1500);

        } else {
          playButton.textContent = 'Play';
          clearInterval(intervalId);
        }
      
    }
    });

    function incrementYear() { 
      if (year < 2013) {
        const selectedAttribute = xDropdown.value;
        year = +document.getElementById('year').value + 1;
        year = year.toString();
        document.getElementById('year').value  = year ;
        console.log('inside the increment Drawing for year: ',year)
        updateBeeswarm( selectedValues, selectedAttribute, year);
        console.log('year ', year);
        tooltip.remove();
        tooltip= d3.select("body")
        .append("div")
        .attr("class", "tooltip");
      } else {
        clearInterval(intervalId);
        isPlaying = false;
        playButton.textContent = 'Play';
      }
    }
  

    xDropdown.addEventListener("change", function() {
        const selectedValue = xDropdown.value;
        console.log("Selected value in x-axis dropdown:", selectedValue);
        console.log('region in x-axis dropdown listener ',selectedValues);
        const year = document.getElementById('year').value;
        updateBeeswarm( selectedValues, selectedValue, year);
    });

    sizeDropdown.addEventListener("change", function() {
      const selectedSizeValue = sizeDropdown.value;
      console.log("Selected value in size dropdown:", selectedSizeValue);
      const year = document.getElementById('year').value;
      // console.log(filteredData);
      const selectedAttribute = xDropdown.value;
      
      updateBeeswarm( selectedValues, selectedAttribute, year);
    });

    
    boxplotattr.addEventListener("change", function() {
        const selectedValue = boxplotattr.value;
        console.log("Selected value in boxplot dropdown:", selectedValue);
        console.log('region in x-axis dropdown listener ',selectedValues);
        const year = document.getElementById('year').value;
        updateBoxPlot(beeswarmData, selectedValues, selectedValue, year);
    });
      
    yearInput.addEventListener('change', function () {
      const enteredYear = parseInt(yearInput.value, 10);

      if (enteredYear < 1980 || enteredYear > 2013) {
        yearInputError.textContent = "Year must be between 1980 and 2013!";
        yearInput.setCustomValidity("Invalid year");
      } else {
        yearInputError.textContent = "";
        yearInput.setCustomValidity("");
        const selectedYear = this.value;
        const selectedAttribute = xDropdown.value; 
        const selectedSizeValue = sizeDropdown.value; 
        console.log('inside yearinput')
       
        updateBeeswarm( selectedValues, selectedAttribute, selectedYear);
      }
      
     
    });
      
    tooltip= d3.select("body")
    .append("div")
    .attr("class", "tooltip");
    
d3.csv("merged_data.csv").then(function(data) {

   margin = { top: 20, right: 20, bottom: 50, left: 50 };
   width = 800 - margin.left - margin.right;
   height = 500 - margin.top - margin.bottom;
   beeswarmData = data;
 
  svg = d3.select("#beeswarm_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  
  xScale = d3.scaleLinear().range([0, width]);
 

  });
});


function updateBeeswarm( regions, attribute, year) {
  console.log('inside update beeswarm '+attribute);
  console.log('inside update beeswarm function region:',regions)
 
  
  filteredData = beeswarmData.filter(d => regions.includes(d.Region) && year.includes(d.Year));
 
  let sizeDropdown = document.getElementById("size");
  let sizeValue = sizeDropdown.value;
  const sizeScale = calculateSizeScale(filteredData, sizeValue);
  
  updateXAxis(filteredData, attribute);
          

  let simulation = d3.forceSimulation(filteredData)
        .force("x", d3.forceX(d => xScale(+d[attribute])).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1))
        .force("collide", d3.forceCollide(d => sizeScale(+d[sizeValue]) + 2)) 
          
       
  for(let i =0;i<300;i++){simulation.tick();}

    
    circles = svg.selectAll("circle")
    .data(filteredData,d => d.name)
    .join(
      enter =>  enter.append('circle')
        .attr('cx', d => d.x) 
        .attr('cy', d => d.y) 
        .attr('r', 0) 
        .style("fill", d => colorScale(d.Region))
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", 0) 
        .transition()
          .duration(1000)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', d => sizeScale(+d[sizeValue]))
          .style("opacity", 1) 
        
         ,
    update  => update.transition()
                    .duration(1000)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', d => sizeScale(+d[sizeValue]))
                   
    )

    circles.on("mouseenter", function (event, d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 1);
          tooltip.html(
            `<strong>Country:</strong> ${d.name}<br>` +
            `<strong>${attribute}:</strong> ${(+d[attribute]).toFixed(2)}<br>` +
            `<strong>${sizeValue}:</strong> ${(+d[sizeValue]).toFixed(2)}<br>` +
            `<strong>Year:</strong> ${d.Year}<br>`+
            `<strong>Flag:<strong> <img src="${d.imageUrl}" alt="" width="30" height="20" style="border: 1px solid #000;">`
          )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseleave", function (d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0); 
        })
        

}


function updateXAxis(filteredData, attribute) {
 
  const xExtent = d3.extent(filteredData, d => +d[attribute]);
  svg.select('g').remove();


  xAxis = svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`);


  xScale.domain(xExtent);
  xAxis.call(d3.axisBottom(xScale));
  xAxis.selectAll(".x-axis-label").remove();
 
  xAxis.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr('opacity',0)
    .style("fill", "black") 
    .style("font-size", "12px") 
    .text(attribute);



    
}

function calculateSizeScale(data, selectedValue) {
  const valueExtent = d3.extent(data, d => +d[selectedValue]);
  return d3.scaleLinear()
    .domain(valueExtent)
    .range([4, 30]);
}


function updateSizeScaleAndCircles(data, selectedValue) {
  const sizeScale = calculateSizeScale(data, selectedValue);
  circles
    .attr("r", d => sizeScale(+d[selectedValue]));
}

function updateBoxPlot(data, regions, attribute, year){

  var filteredDataForBoxplot = data.filter(d => regions.includes(d.Region) && year.includes(d.Year));
 // Extract the values for the selected attribute
 console.log('values for filteredDataForBoxplot',filteredDataForBoxplot,attribute)
 var values = filteredDataForBoxplot.map(d => +d[attribute]);
 console.log('values for boxplot',values)
 // Sort the data for box plot calculations
 var data_sorted = values.sort(d3.ascending);
 var q1 = d3.quantile(data_sorted, 0.25);
 var median = d3.quantile(data_sorted, 0.5);
 var q3 = d3.quantile(data_sorted, 0.75);
 var interQuantileRange = q3 - q1;
 var min = q1 - 1.5 * interQuantileRange;
 var max = q3 + 1.5 * interQuantileRange;

//  d3.select("#box_plot").remove();


 var svg1 = d3.select("#box_plot")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

 var y = d3.scaleLinear()
   .domain([d3.min(data_sorted), d3.max(data_sorted)])
   .range([height, 0]);

 // Show the Y scale
 svg1.call(d3.axisLeft(y));

 
 var center = 75;
 var boxWidth = 200;

 svg1.append("line")

   .attr("x1", center)
   .attr("x2", center)
   .attr("y1", y(min))
   .attr("y2", y(max))
   .attr("stroke", "black");

 svg1.append("rect")
   .attr("x", center - boxWidth / 2)
   .attr("y", y(q3))
   .attr("height", y(q1) - y(q3))
   .attr("width", boxWidth)
   .attr("stroke", "black")
   .style("fill", "#69b3a2");

 
 var linesData = [min, median, max];

 svg1.selectAll("line.toto")
   .data(linesData)
   .enter()
   .append("line")
   .attr("x1", center - boxWidth / 2)
   .attr("x2", center + boxWidth / 2)
   .attr("y1", function (d) {
     return y(d);
   })
   .attr("y2", function (d) {
     return y(d);
   })
   .attr("stroke", "black");

}
