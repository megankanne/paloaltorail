const legend = {height: 10, width: 200, marginTop: 20};
const margin = {top: 100 + legend.height + legend.marginTop, right: 0, bottom: 10, left: 100};
const width = document.body.clientWidth;
const initialImpactRange = [0, 20, 40, 60, 80, 100];
const row = {criteriaWidth: width * .3, textPadding: 5, height: 50}

export { initialImpactRange, margin, legend, row, width };