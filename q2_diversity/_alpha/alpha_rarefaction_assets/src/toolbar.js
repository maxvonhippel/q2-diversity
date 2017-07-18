/* global d */

export default function addMetricPicker(row, metrics, selectedMetric) {
  const downloadDiv = row.append('div')
    .attr('class', 'col-lg-2 form-group downloadCSV');
  const downloadHref = downloadDiv.append('a')
      .attr('href', `metric-${selectedMetric}.csv`)
      .text('Download CSV');

  const grp = row.append('div').attr('class', 'col-lg-2 form-group metricPicker');
  grp.append('label').text('Metric');
  grp.append('select')
    .attr('class', 'form-control')
    .on('change', function changeCategory() {
      const newMetric = metrics[this.selectedIndex];
      downloadHref.attr('href', `metric-${newMetric}.csv`);
      console.log(d);
    })
    .selectAll('option')
    .data(metrics)
    .enter()
      .append('option')
      .attr('value', d => d)
      .text(d => d)
      .property('selected', d => (d === selectedMetric));
  return grp;
}
