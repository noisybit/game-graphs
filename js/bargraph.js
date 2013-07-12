graph = (function(graph) {

  var margin = {top: 20, right: 40, bottom: 60, left: 60};
  var width = window.innerWidth - margin.left - margin.right;
  var height = 240 - margin.top - margin.bottom;

  graph.bargraph = function(options) {
    // Create the graph and offset by margins
    var svg = d3.select(options.svg)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var y = d3.scale.linear()
        .range([height, 0]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(d3.format())

    // Create the x scale
    var x = d3.scale.ordinal()
        .rangeBands([0, width], 0.1);

    // x label - because we aren't labeling EVERY input
    var xLabel = d3.scale.ordinal()
        .rangeBands([0, width])

    var xAxis = d3.svg.axis()
        .scale(xLabel)
        .orient('bottom')
        .tickPadding(0.7)

    // Draw the xAxis
    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0, '+height+')')
      .append('text')
        .attr('y', 20)
        .attr('x', width/2 - margin.left)
        .attr('dy', '.71em')
        .text(options.xLabel);

    // Draw the yAxis
    svg.append('g')
        .attr('class', 'yAxis')
      .append('text')
        .attr('y', -12)
        .attr('x', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text(options.yLabel);

    function resize() {
      this.width = window.innerWidth - margin.left - margin.right;
      svg.attr('width', this.width + margin.left + margin.right)
      x.rangeBands([0, this.width], 0.1);
      xLabel.rangeBands([0, this.width])
      svg.select('.xAxis > text').attr('x', this.width/2 - margin.left)
    }

    function render(data) {

        var xLabelDomain = data.filter(function(d, i, arr) {
          var blockSize = Math.floor(arr.length / 8);
          return i % blockSize  === Math.floor((blockSize / 2))
        }).map(function(d){ return d[options.xSelector]; })

        // Scale the domains
        y.domain([0, d3.max(data, function(d) { return d[options.yMax]; })]);
        x.domain(data.map(function(d, i){ return i; }));
        xLabel.domain(xLabelDomain)

        // Update both Axes
        svg.select('.yAxis').call(yAxis);
        svg.select('.xAxis').call(xAxis);


        // Draw the bar graph
        var bars = svg.selectAll('.bar')
              .data(data)

        bars.enter().append('rect')
            .attr('class', 'bar')
            .on('mouseover', graph.showTooltip)
            .on('mousemove', graph.moveTooltip)
            .on('mouseout', graph.hideTooltip)
            .on('click', function(d) {
              window.open(d.href, '_blank');
            })

        bars
          .attr('x', function(d, i) { return x(d.title); })
          .attr('y', function(d) { return y(d[options.yInput]); })
          .attr('height', function(d) { return height - y(d[options.yInput]); })
          .attr('fill', function(d) { return graph.color(d.genre); })
          .attr('width', x.rangeBand())

        bars.exit().remove();
    }

    return {
      margin: margin,
      width: width,
      height: height,
      svg: svg,
      x: x,
      y: y,
      xAxis: xAxis,
      yAxis: yAxis,
      xLabel: xLabel,
      resize: resize,
      render: render
  };

  }
  return graph;
}(window.graph || {}))
