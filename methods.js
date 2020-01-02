import { margin } from "./constants.js";

// Mutates columns
function updateColumnOrder(impactInputs, gx, x, xAxis, alternativeRank) {
  impactInputs
    .transition().duration(500)
      .style("left", d => `${x(d.name) + margin.left}px`);
  gx.transition().duration(500)
    .call(xAxis, x, alternativeRank);
}

// Mutates alternativeRank
function reRankAlternatives(criteria, alternativeRank) {
  let ranking = getAlternativesRanking(criteria)
  Object.assign(alternativeRank, ranking);
}

// Returns updated alternative ranking given criteria
function getAlternativesRanking(criteria) {
  return criteria.reduce(function(ranks, c, i) {
    c.alternatives.forEach(a => {
      var curAlternativeRanking = ranks[a.name] === undefined ? 0 : ranks[a.name];
      ranks[a.name] = curAlternativeRanking + (a.impact * c.weight);
    })
    return ranks;
  }, {});
}

// Returns height
function getHeight(criteria) {
  return criteria.length * 40 + margin.top + margin.bottom;
}

export { getAlternativesRanking, getHeight, reRankAlternatives, updateColumnOrder };
