// Obessity chart

const MARGIN = { LEFT: 60, RIGTH: 10, TOP: 10, BOTTOM: 50 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGTH;
const HEIGHT = 600 - MARGIN.BOTTOM - MARGIN.TOP;

let time = 0;
let interval;
let formatedData;

// Plot
const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGTH)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

// Bounds
const g = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT},${MARGIN.TOP})`);

//   tooltips
const tip = d3
  .tip()
  .attr("class", "d3-tip")
  .html((d) => {
    let text = `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${d.Entity}</span><br>`;
    text += `<strong>Population:</strong> <span style='color:red;text-transform:capitalize'>${d3.format(
      ",.0f"
    )(d.Population)}</span><br>`;
    text += `<strong>Daily caloric supply:</strong> <span style='color:red;text-transform:capitalize'>${
      d.Daily_caloric_supply + " Kcal"
    }</span><br>`;
    text += `<strong>Overweight:</strong> <span style='color:red;text-transform:capitalize'>${
      d.Overweight_or_Obese + "%"
    }</span><br>`;

    return text;
  });
g.call(tip);

// X
const xAccessor = (d) => d.Daily_caloric_supply;
const xScale = d3.scaleLinear().domain([1300, 4200]).range([0, WIDTH]).nice();
const xAxis = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(${0},${HEIGHT})`);
const xLabel = g
  .append("text")
  .attr("class", "x label")
  .attr("x", WIDTH / 2 - 100)
  .attr("y", HEIGHT + MARGIN.BOTTOM)
  .attr("font-size", "1.4em")
  .html("Daily caloric supply");

// Y
const yAccessor = (d) => d.Overweight_or_Obese;
const yScale = d3.scaleLinear().domain([0, 75]).range([HEIGHT, 0]);
const yAxis = g.append("g").attr("class", "y axis");
const yLabel = g
  .append("text")
  .attr("class", "y label")
  .attr("x", -HEIGHT / 2)
  .attr("y", -MARGIN.LEFT + 20)
  .attr("font-size", "1.4em")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .html("Overweight or Obese");

// size
const areaAccesor = (d) => Math.sqrt(d.Population) / Math.PI;
const areaScale = d3
  .scaleLinear()
  .domain([200, 10000])
  .range([2 * Math.PI, 10 * Math.PI]);

// Color
const colorAccessor = (d) => d.Continent;
const continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
const colorScale = d3.scaleOrdinal(d3.schemePastel1);

// Legend
const legend = g
  .append("g")
  .attr("transform", `translate(${WIDTH - 20},${HEIGHT - 190})`);
continents.map((continent, i) => {
  const legendRow = legend
    .append("g")
    .attr("transform", `translate(0,${i * 20})`);

  legendRow
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", colorScale(continent));

  legendRow
    .append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    // .style("text-transform", "capitalize")
    .text(continent);
});

// Time Label
const yearLabel = g
  .append("text")
  .attr("x", WIDTH - 100)
  .attr("y", HEIGHT - 20)
  .attr("font-size", "2.5em")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle");

d3.json("data/data.json").then((data) => {
  console.log(data[0]);
  console.log(data[0].Year);
  formatedData = data;
  console.log(data.length);
  //   first runt of the visualization
  update(formatedData[0].countries, formatedData[0].Year);
});

function step() {
  // At the end of our data, loop back
  time = time < 34 ? time + 1 : 0;
  update(formatedData[time].countries, formatedData[time].Year);
}

$("#play-button").on("click", function () {
  const button = $(this);
  if (button.text() === "Play") {
    button.text("Pause");
    interval = setInterval(step, 500);
    console.log(time);
  } else {
    button.text("Play");
    clearInterval(interval);
  }
});

$("#reset-button").on("click", () => {
  time = 0;
  console.log(time);
  update(formatedData[time].countries, formatedData[time].Year);
});

$("#continent-select").on("change", () => {
  update(formatedData[time].countries, formatedData[time].Year);
});

function update(data, year) {
  // transition time
  const t = d3.transition().duration(500);

  const continent = $("#continent-select").val();

  const filteredData = data.filter((country) => {
    if (continent === "all") return true;
    else {
      return country.Continent === continent;
    }
  });

  // x Axis
  const xAxisCall = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickFormat((d) => d + " Kcal");
  xAxis.call(xAxisCall);

  // y Axis
  const yAxisCall = d3
    .axisLeft(yScale)
    .ticks(7)
    .tickFormat((d) => d + "%");
  yAxis.call(yAxisCall);

  // Join
  const dots = g.selectAll("circle").data(filteredData, (d) => d.Entity);

  // Exit
  dots.exit().remove();

  //   Enter and join
  dots
    .enter()
    .append("circle")
    .attr("fill", (d) => colorScale(colorAccessor(d)))
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(dots)
    .transition(t)
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("r", (d) => areaScale(areaAccesor(d)));

  yearLabel.text(year);
}
