$(function() {
  var margin = {top: 20, right: 40, bottom: 30, left: 20};
  var width = 500 - margin.left - margin.right;
  var height = 1000 - margin.top - margin.bottom;
  var barWidth = Math.floor(width / 19) - 1

  var x = d3.scale.linear()
      .range([barWidth / 2, width - barWidth / 2]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(width)
      .tickFormat(function(d) { return Math.round(d/ 1e6) + 'M'; });

  var svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


  d3.json('/data/rated.json', function(err, data) {

    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviewCount = +d.reviewCount;
    })

    y.domain([0, 10]);

    var bar = svg.selectAll('rect')
        .data(data.sort(function(a, b){ return b.reviewCount - a.reviewCount; }))
      .enter().append('rect')
        .attr('x', barWidth)
        .attr('y', function(d){ return d.rating; })
  })
})
