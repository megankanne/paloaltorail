/**
 * Setup
 */

import { color, legendX, textColor, xAxis, xPromise, yAxis, yPromise } from "./scales.js";

import { criteriaPromise } from "./data.js";

import { criteriaWidth, initialImpactRange, legend, margin, width } from "./constants.js";

import { getAlternativesRanking, getHeight, reRankAlternatives, updateColumnOrder } from "./methods.js";

Promise
  .all([criteriaPromise, xPromise, yPromise])
  .then(([criteria, x, y]) => {

    const height = getHeight(criteria);

    // Mutated by user
    let alternativeRank = getAlternativesRanking(criteria);

    /**
     * Chart
     */

    const body = d3.select(".visualization");
      
      // Weight inputs
    const weightsLabel = body
      .append("p")
        .text("Priority")
        .attr("style", d => `position:absolute; top:${margin.top-40}px;`)
        .style("position", "absolute")
        .style("font", "14px sans-serif")
    const criteriaWeights = body
        .selectAll(".criteria-weight")
      .data(criteria)
      .enter().append("div")
        .classed("criteria-weight", true)
        .style("top", d => `${y(d.name)}px`);
    const priorityDecrementButton = criteriaWeights
        .append("input")
          .classed("priority-button", true)
          .attr("type", "button")
          .attr("value", "-")
          .style("width", `${margin.left/4}px`)
          .style("height", `${y.bandwidth()}px`)
          .on("click", d => { 
            const number = d3.event.target.parentNode.querySelector('input[type=number]');
            number.stepDown();
            number.dispatchEvent(new Event('change')); 
          });
    const criteriaPriorityInput = criteriaWeights
      .append("input")
        .classed("criteria-weight-input", true)
        .attr("type", "number")
        .style("width", d => `${margin.left/4}px`)
        .style("height", `${y.bandwidth()}px`)
        .attr("value", d => d.weight)
        .attr("min", 1)
        .on("change", d => { 
          const v = d3.event.target.valueAsNumber;
          d.weight = v == undefined ? 0 : v;
          
          // re-rank the alternatives
          reRankAlternatives(criteria, alternativeRank);
          // update the order in the x-scale
          x.domain(Object.keys(alternativeRank).sort((a, b) => alternativeRank[a] - alternativeRank[b]));  

          // move the columns and the x axis to match
          updateColumnOrder(impactInputs, gx, x, xAxis, alternativeRank);
        });
    const priorityIncrementButton = criteriaWeights
        .append("input")
          .classed("priority-button", true)
          .attr("type", "button")
          .attr("value", "+")
          .style("width", `${margin.left/4}px`)
          .style("height", `${y.bandwidth()}px`)
          .on("click", d => { 
            const number = d3.event.target.parentNode.querySelector('input[type=number]');
            number.stepUp();
            number.dispatchEvent(new Event('change')); 
          });

    // Impact inputs
    const impactInputsGroup = body
      .selectAll(".alternative-impact-group")
      .data(criteria)
      .enter().append("div")
        .classed("alternative-impact-group", true)
        .style("position", "absolute")
        .style("top", d => `${y(d.name)}px`);

    const impactInputs = impactInputsGroup
        .selectAll(".alternative-impact-div")
        .data(d => d.alternatives)
        .enter().append("div")
          .classed("alternative-impact-div", true)
          .style("width", `${x.bandwidth()}px`)
          .style("left", d => `${x(d.name) + margin.left}px`);

    const impactDecrementButton = impactInputs
        .append("input")
          .classed("alternative-impact-button", true)
          .attr("type", "button")
          .attr("value", "-")
          .style("background-color", d => color(d.impact))
          .style("color", d => textColor(d.impact))
          .style("width", `${x.bandwidth()/5}px`)
          .style("height", `${y.bandwidth()}px`)
          .on("click", d => { 
            const number = d3.event.target.parentNode.querySelector('input[type=number]');
            number.stepDown();
            number.dispatchEvent(new Event('change')); 
          });

    const impactNumberInputs = impactInputs
          .append("input")
            .classed("alternative-impact", true)
            .attr("type", "number")
            .style("width", `${x.bandwidth()/5*3}px`)
            .style("height", `${y.bandwidth()}px`)
            .style("background-color", d => color(d.impact))
            .style("color", d => textColor(d.impact))
            .attr("value", d => d.impact)
            .attr("min", 0)
            .attr("max", 100)
            .on("change", d => { 
              const v = d3.event.target.valueAsNumber;
              d.impact = v == undefined ? 0 : v;

              // update the color
              d3.select(d3.event.target)
                .style("background-color", color(d.impact));
              d3.select(d3.event.target.parentNode)
                .selectAll('input[type=button]')
                  .style("background-color", color(d.impact));

              // re-rank the alternatives
              reRankAlternatives(criteria, alternativeRank);
              // update the order in the x-scale
              x.domain(Object.keys(alternativeRank).sort((a, b) => alternativeRank[a] - alternativeRank[b]));

              // move the columns and the x axis to match
              updateColumnOrder(impactInputs, gx, x, xAxis, alternativeRank);
            });

    const impactIncrementButton = impactInputs
        .append("input")
          .classed("alternative-impact-button", true)
          .attr("type", "button")
          .attr("value", "+")
          .style("background-color", d => color(d.impact))
          .style("color", d => textColor(d.impact))
          .style("width", `${x.bandwidth()/5}px`)
          .style("height", `${y.bandwidth()}px`)
          .on("click", d => { 
            const number = d3.event.target.parentNode.querySelector('input[type=number]');
            number.stepUp();
            number.dispatchEvent(new Event('change')); 
          });

    const svg = body.append("svg:svg")
        .attr("width", width)
        .attr("height", height);

    // Criteria rows
    const criteriaRows = svg
        .selectAll(".criteria")
      .data(criteria)
      .enter().append("g")
        .classed("criteria", true)
        .attr("transform", d => "translate("+ margin.left + "," + y(d.name) + ")")
        .attr("cursor", "ns-resize")
        .call(d3.drag()
          .on("start", (d) => d3.select(d3.event.sourceEvent.target.parentElement).raise())
          .on("drag", function (d) {       
            function yPosition(c) {
              return c === d ? d3.event.y : y(c.name);
            }
          
            // re-order the data
            criteria.sort((a, b) => {
              return yPosition(a) - yPosition(b)
            })
            // update the order in the y-scale
            y.domain(criteria.map(d => d.name))
            
            // move the rows and the y axis to match
            criteriaRows
              .attr("transform", d => "translate("+ margin.left + "," + yPosition(d) + ")")
            gy.call(yAxis, y)
            // move the inputs too
            criteriaWeights
              .style("top", d => `${yPosition(d)}px`)
            impactInputsGroup
              .style("top", d => `${yPosition(d)}px`);
          })
          .on("end", function(d) {
            // snap the group to their y position
            d3.select(this)
              .transition().duration(500)
                .attr("transform", d => "translate("+ margin.left + "," + y(d.name) + ")")
            criteriaWeights
              .transition().duration(500)
                .style("top", d => `${y(d.name)}px`)
            impactInputsGroup
              .transition().duration(500)
                .style("top", d => `${y(d.name)}px`);
          })
         );
      
    // Criteria bars
    const criteriaBars = criteriaRows
      .append("rect")
        .classed("criteria-bar", true)
        .attr("fill", "lightgray")
        .attr("width", criteriaWidth)
        .attr("height", y.bandwidth());

    // Criteria labels
    const criteriaLabels = criteriaRows
      .append("text")
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .style("font", "12px sans-serif")
        .attr("x", 4)
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => d.desc);

    // Axes
    const gx = svg.append("g")
        .call(xAxis, x, alternativeRank);
    gx.selectAll("text")
      .style("font", "14px sans-serif")
      .attr("dy", -4);

    const gy = svg.append("g")
        .call(yAxis, y);

    // Legend
    const legendGroup = svg.append("g")
    const legendRange = legendGroup
      .selectAll(".legend")
      .data(initialImpactRange)
       .join("rect")
        .classed("legend", true)
        .attr("transform", d => "translate("+ legendX(d) + ","+ legend.marginTop +")")
        .attr("width", legendX.bandwidth())
        .attr("height", legend.height)
        .attr("fill", d => color(d));
    const legendLessImpact = legendGroup
      .append("text")
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "hanging")
        .style("font", "12px sans-serif")
        .attr("x", width - legend.width)
        .attr("y", legend.marginTop / 2)
        .attr("dy", "0.35em")
        .text("Greater benefit")
    const legendMoreImpact = legendGroup
      .append("text")
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "hanging")
        .style("font", "12px sans-serif")
        .attr("x", width)
        .attr("y", legend.marginTop / 2)
        .attr("dy", "0.35em")
        .text("More impact")
});
