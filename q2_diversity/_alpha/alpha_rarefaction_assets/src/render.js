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

function resetTable(data) {
  const tableHead = select('.tableHead');
  tableHead.style('background-color', 'white');
  const tableMetricHead = tableHead.selectAll('th')._groups[0][1];
  select(tableMetricHead).text(data.yAxisLabel);
  select('.tableBody')
    .selectAll('tr')
      .data([
        ['2nd', '...'],
        ['9th', '...'],
        ['25th', '...'],
        ['50th (Median)', '...'],
        ['75th', '...'],
        ['91st', '...'],
        ['98th', '...'],
      ])
      .selectAll('td')
        .data(e => e)
        .text(e => e);
  return tableHead;
}

// re-render chart and legend whenever selection changes
function renderPlot(svg, data, x, y, category, legend, legendTitle) {
  const chart = svg.select('g');
  const legendBox = select(legend.node().parentNode);

  // find the indices of components
  const depthIndex = data.data.columns.indexOf('depth');
  const firstIndex = data.data.columns.indexOf('2');
  const secondIndex = data.data.columns.indexOf('9');
  const thirdIndex = data.data.columns.indexOf('25');
  const fourthIndex = data.data.columns.indexOf('50');
  const fifthIndex = data.data.columns.indexOf('75');
  const sixthIndex = data.data.columns.indexOf('91');
  const seventIndex = data.data.columns.indexOf('98');
  let groupIndex = data.data.columns.indexOf('sample-id');
  if (groupIndex === -1) {
    groupIndex = data.data.columns.indexOf(category);
  }

  // determine data to parse
  const points = [data.data.data][0];
  const setGroups = new Set(Array.from(points, d => d[groupIndex]));
  const color = scaleOrdinal(schemeCategory20)
    .domain(setGroups);
  const arrGroups = Array.from(setGroups);

  // legend is not yet d3-esque, unfortunately, hence
  // the necessity of the remove() calls
  legend.selectAll('.legend').remove();
  legendTitle.selectAll('.legend').remove();
  // resize the legend to accomodate all of the keys
  // this way there is no extra scroll space in the list
  legend.attr('height', arrGroups.length * 20);

  const tableHead = resetTable(data);

  let ly = 0;
  const all = 'Select%20All';
  appendSeries(all, [], 'black');
  toggle(all, 'white', null);
  appendLegendKey(legendTitle, all, 10, color);
  for (const [i, entry] of arrGroups.entries()) {
    ly = (i + 0.5) * 20;
    const subset = points.filter(d => d[groupIndex] === entry)
                    .sort((a, b) => a[depthIndex] - b[depthIndex]);
    const curColor = color(entry);
    appendSeries(entry, subset, curColor);
    toggle(entry, 'white', null);
    appendLegendKey(legend, entry, ly, color);
  }
  // DOTS
  function plotDots(selection) {
    selection.attr('class', d => `circle ${d[groupIndex]}`)
      .attr('fill', d => color(d[groupIndex]))
      .attr('opacity', d => curData[d[groupIndex]].dotsOpacity)
      .attr('stroke', d => color(d[groupIndex]))
      .attr('cx', d => x(d[depthIndex]))
      .attr('cy', d => y(d[fourthIndex]))
      .on('mouseover', (d) => {
        if (curData[d[groupIndex]].dotsOpacity === 1) {
          select('.tableBody').selectAll('tr')
              .data([
                ['2nd', d[firstIndex]],
                ['9th', d[secondIndex]],
                ['25th', d[thirdIndex]],
                ['50th (Median)', d[fourthIndex]],
                ['75th', d[fifthIndex]],
                ['91st', d[sixthIndex]],
                ['98th', d[seventIndex]],
              ])
              .selectAll('td')
              .data(e => e)
              .text(e => e);
          tableHead.style('background-color',
            `${color(d[groupIndex])}`);
        }
      });
  }
  const dotsUpdate = chart.selectAll('.circle').data(points);
  dotsUpdate.exit().transition().remove();
  const dotsEnter = dotsUpdate.enter().append('circle')
    .attr('r', 4);
  dotsUpdate.call(plotDots);
  dotsEnter.call(plotDots);
  legendBox.attr('viewBox', `0 0 200 ${ly + 10}`);
  // LINES
  const valueline = line()
    .x(d => x(d[depthIndex]))
    .y(d => y(d[fourthIndex]));
  const datum = nest()
    .key(d => d[groupIndex])
    .entries(points);
  const linesUpdate = chart.selectAll('.line').data(datum);
  linesUpdate.exit().transition().remove();
  linesUpdate.enter().append('path')
    .attr('class', d => `line ${d.key}`)
    .attr('stroke', d => color(d.key))
    .attr('opacity', d => curData[d.key].lineOpacity)
    .attr('fill', 'none')
    .attr('d', d => valueline(d.values));
  linesUpdate.attr('class', d => `line ${d.key}`)
    .attr('stroke', d => color(d.key))
    .attr('opacity', d => curData[d.key].lineOpacity)
    .attr('d', d => valueline(d.values));
}

// re-render chart edges, exis, formatting, etc. when selection changes
export default function render(svg, data, category, legend, legendTitle) {
  const height = 400;
  const width = 1000;
  const margin = { top: 20, left: 80, right: 50, bottom: 50 };
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

  setupXLabel(svg, width, height, xAxisLabel, xAxis);
  const maxLabelY = setupYLabel(svg, height, yAxisLabel, yAxis);
  const moveX = Math.max(margin.left, maxLabelY);
  svg.attr('width', width + moveX + margin.right)
    .attr('height', height + margin.bottom + margin.top);
  select(svg.node().parentNode).style('width', `${width + moveX + margin.right}px`)
    .style('height', `${height + margin.bottom + margin.top}px`);
  chart.attr('transform', `translate(${moveX},${margin.top})`);
  select('.tableCol').style('margin-left', `${moveX + 10}px`);
  renderPlot(svg, data, x, y, category, legend, legendTitle);
}
