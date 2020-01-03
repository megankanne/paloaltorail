import { initialImpactRange } from "./constants.js";

const impactScale = d3.scaleQuantile()
    .domain([1,6])
    .range(initialImpactRange);

const alternatives = d3.csv(
  "https://gist.githubusercontent.com/megankanne/a2222d07b9ba76b12480c880b9b1c50b/raw/d5441ce1691092933732ced9c211e209d32bcbac/alternatives.csv", 
  ({alternative, criteria, value}) => ({name: alternative, impact: impactScale(+value), criteria: criteria}));

const criteriaPromise = alternatives.then( (alts) => {
  return d3.csv(
    "https://gist.githubusercontent.com/megankanne/266e36875ba3d63fcb3758057ebeab15/raw/3d629d41749cbc9ef2a7634769157fbde5085662/criteria.csv", 
    ({letter, description, rank}) => ({name: letter, desc: description, weight: 1, alternatives: alts.filter(a => a.criteria === letter)}))
});

export { criteriaPromise };