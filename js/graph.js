$(function() {
  var margin = {top: 20, right: 40, bottom: 60, left: 25};
  var width = window.innerWidth - margin.left - margin.right;
  var height = 240 - margin.top - margin.bottom;
  var bars = 1400;
  var barWidth = Math.floor(width / bars) - 1
  var color = d3.scale.category10();
  var scrollSpeed = 8;
  var index = 0;

  // Create the graph and offset by margins
  var svg = d3.select('#graph')
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

  var xRatingScale = d3.scale.ordinal()
      .rangeBands([0, width])

  var xAxis = d3.svg.axis()
      .scale(xRatingScale)
      .orient('bottom')
      .tickPadding(0.7)

  // Grab the data
  d3.json('/data/rated.json', function(err, data) {

    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviewCount = +d.reviewCount;
    })

    // Sort by number of reviews
    data = data.sort(function(a, b) {
      var reviews = b.reviewCount - a.reviewCount;
      // if equal reviewCount, sort by rating
      if(reviews === 0)
        return b.rating - a.rating;
      else
        return reviews;
    })

    var xRatingScaleDomain = data.filter(function(d, i, arr) {
      var blockSize = Math.floor(arr.length / 8);
      return i % blockSize  === Math.floor((blockSize / 2))
    }).map(function(d){ return d.reviewCount; })

    // Scale the domains
    y.domain([0, 10]);
    x.domain(data.map(function(d, i){ return i; }));
    xRatingScale.domain(xRatingScaleDomain)

    // Draw the xAxis
    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0, '+height+')')
        .call(xAxis)
      .append('text')
        .attr('y', 15)
        .attr('x', width/2 - margin.left)
        .attr('dy', '.71em')
        .text('Reviews');

    // Draw the yAxis
    svg.append('g')
        .attr('class', 'yAxis')
        .call(yAxis)
      .append('text')
        .attr('y', -12)
        .attr('x', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text('Rating');

    // Draw the bar graph
    var bargraph = svg.selectAll('.bar')
          .data(data)

    bargraph.enter().append('rect')
        .attr('class', 'bar')
        .attr('width', x.rangeBand())
        .on('mouseover', showTooltip)
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip)

    bargraph
      .attr('x', function(d, i) { return x(d.title); })
      .attr('y', function(d) { return y(d.rating); })
      .attr('height', function(d) { return height - y(d.rating); })
      .attr('fill', function(d) { return color(d.genre); })

    // Draw the legend
    var legend = d3.select('#legend')
          .attr('width', 150)
          .attr('height', 150)

    var nodes = legend.selectAll('g')
          .data(color.domain()).enter()
            .append('g')
              .attr('class', 'legend')
              .attr('transform', function(d, i) { return 'translate(0, '+i*16+')';})

    nodes.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', function(d){ return color(d) })

    nodes.append('text')
          .attr('x', 13)
          .attr('dy', '.71em')
          .style('text-anchor', 'start')
          .text(function(d){ return d; });

    var $tooltip = $('#gameInfo');
    function showTooltip(d) {
      setTooltip(d);
      $tooltip.show();
    }

    function hideTooltip() {
      $tooltip.hide();
    }

    function moveTooltip() {
      $tooltip.css('top', (d3.event.pageY-10)+"px").css('left', (d3.event.pageX+10)+"px")
    }

    function setTooltip(d) {
      $tooltip.find('#title').html(d.title);
      $tooltip.find('#boxart').attr('src', d.boxart);
      $tooltip.find('#rating').html(d.rating);
      $tooltip.find('#reviews').html(d.reviewCount);
    }
  })
})
