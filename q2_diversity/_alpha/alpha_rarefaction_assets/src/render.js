import {
  scaleLinear,
  axisBottom,
  axisLeft,
  scaleOrdinal,
  schemeCategory20,
  select,
  line,
  nest,
} from 'd3';

import { setupXLabel, setupYLabel } from './axis';
import appendLegendKey from './legend';
import { curData, appendSeries, toggle } from './data';

// re-render chart and legend whenever selection changes
function renderPlot(svg, data, x, y, category, legend, legendTitle) {
  const chart = svg.select('g');

  const depthIndex = data.data.columns.indexOf('depth');
  const medianIndex = data.data.columns.indexOf('median');
  let groupIndex = data.data.columns.indexOf('sample-id');
  if (groupIndex === -1) {
    groupIndex = data.data.columns.indexOf(category);
  }
  const points = [data.data.data.sort((a, b) => a[depthIndex] - b[depthIndex])][0];
  const setGroups = new Set(Array.from(points, d => d[groupIndex]));
  const color = scaleOrdinal(schemeCategory20)
    .domain(setGroups);
  const arrGroups = Array.from(setGroups);

  const legendBox = select(legend.node().parentNode);

  legend.selectAll('.legend').remove();
  legendTitle.selectAll('.legend').remove();

  legend.attr('height', arrGroups.length * 20);
  let ly = 0;

  const all = 'Select%20All';
  appendSeries(all, [], 'black');
  toggle(all, null, 'white');
  appendLegendKey(legendTitle, all, 10, color);
  for (const [i, entry] of arrGroups.entries()) {
    ly = (i + 0.5) * 20;
    const subset = points.filter(d => d[groupIndex] === entry)
                    .sort((a, b) => a[depthIndex] - b[depthIndex]);
    const curColor = color(entry);
    appendSeries(entry, subset, curColor);
    toggle(entry, null, 'white');
    appendLegendKey(legend, entry, ly, color);
  }
  // DOTS
  function plotDots(selection) {
    selection.transition()
      .attr('cx', d => x(d[depthIndex]))
      .attr('cy', d => y(d[medianIndex]));
  }
  const dotsUpdate = chart.selectAll('.circle').data(points);
  dotsUpdate.exit().transition().remove();
  const dotsEnter = dotsUpdate.enter().append('circle')
    .attr('r', 4)
    .attr('stroke', d => color(d[groupIndex]))
    .attr('opacity', d => curData[d[groupIndex]].dotsOpacity)
    .attr('fill', d => color(d[groupIndex]))
    .attr('class', d => `circle ${d[groupIndex]}`);
  dotsUpdate.call(plotDots);
  dotsEnter.call(plotDots);
  legendBox.attr('viewBox', `0 0 200 ${ly + 10}`);
  // LINES
  const valueline = line()
    .x(d => x(d[depthIndex]))
    .y(d => y(d[medianIndex]));
  const datum = nest()
    .key(d => d[groupIndex])
    .entries(points);
  const linesUpdate = chart.selectAll('.line').data(datum);
  linesUpdate.exit().transition().remove();
  linesUpdate.enter().append('path')
    .attr('class', 'line')
    .attr('class', d => `line ${d.key}`)
    .attr('stroke', d => curData[d.key].line)
    .attr('opacity', d => curData[d.key].lineOpacity)
    .attr('fill', 'none')
    .attr('d', d => valueline(d.values));
  linesUpdate.attr('d', d => valueline(d.values));
}

// re-render chart edges, exis, formatting, etc. when selection changes
export default function render(svg, data, category, legend, legendTitle) {
  const height = 400;
  const width = 1000;
  const margin = { top: 20, left: 70, right: 50, bottom: 50 };
  const chart = svg.select('g');

  const { xAxisLabel, yAxisLabel, minX, maxX, minY, maxY } = data;

  const xAxis = axisBottom();
  const yAxis = axisLeft();

  let pad = (maxX - minX) * 0.03;
  if (Number.isInteger(minX) && Number.isInteger(maxX)) {
    pad = Math.max(Math.round(pad), 1);
    const between = Math.max(3, (maxX - minX) + (2 * pad));
    xAxis.ticks(Math.min(between, 12), 'd');
  }

  const x = scaleLinear().domain([minX - pad, maxX + pad]).range([0, width]).nice();
  const y = scaleLinear().domain([minY, maxY]).range([height, 0]).nice();

  xAxis.scale(x);
  yAxis.scale(y);

  chart.attr('transform', `translate(${margin.left},${margin.top})`);

  setupXLabel(svg, width, height, xAxisLabel, xAxis);
  setupYLabel(svg, height, yAxisLabel, yAxis);

  renderPlot(svg, data, x, y, category, legend, legendTitle);

  svg.attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.bottom + margin.top);
}
