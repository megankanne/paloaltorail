import { initialImpactRange, legend, margin, row, width } from "./constants.js";
import { criteriaPromise } from "./data.js";
import { getAlternativesRanking, getHeight } from "./methods.js";

const yPromise = criteriaPromise.then( (criteria) => {

  const criteriaNames = criteria.map(d => d.name);

  const height = getHeight(criteria);

  return d3.scaleBand()
      .domain(criteriaNames)
      .range([margin.top, height - margin.bottom])
      .padding(0.1);
});

const alternativeRankPromise = criteriaPromise.then( (criteria) => {
  return getAlternativesRanking(criteria);
});

const xPromise = alternativeRankPromise.then( (alternativeRank) => {
  return d3.scaleBand()
    .domain(Object.keys(alternativeRank).sort((a, b) => alternativeRank[a] - alternativeRank[b]))
    .range([row.criteriaWidth + 10, width - margin.right - margin.left - 10])
    .padding(0.1);
});

const color = d3.scaleSequential(d3.interpolateRdBu)
    .domain([100, -20]);

const textColor = d3.scaleQuantize()
    .domain([0, 100])
    .range(["white", "black", "white"]);

const legendX = d3.scaleBand()
    .domain(initialImpactRange)
    .range([0, legend.width])
    .padding(0.1);

export { color, legendX, textColor, xPromise, yPromise };
