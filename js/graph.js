$(function() {
  var margin = {top: 20, right: 40, bottom: 60, left: 25};
  var width = window.innerWidth - margin.left - margin.right;
  var height = (window.innerHeight / 1.8)- margin.top - margin.bottom;
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
      
  var yBar = d3.scale.linear()
      .range([height, 0]);

  var yBarAxis = d3.svg.axis()
      .scale(yBar)
      .orient('left')
      .tickFormat(d3.format())

  var yLine = d3.scale.linear()
      .range([height, 0]);

  var yLineAxis = d3.svg.axis()
      .scale(yLine)
      .orient('right')
      .tickFormat(d3.format())

  // Create the x scale
  var x = d3.scale.ordinal()
      .rangeBands([0, width], 0.1);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickPadding(0.7)

  // Setup the line graph
  var line = d3.svg.line()
      .x(function(d, i) { return x(i) })
      .y(function(d) { return yLine(d.reviewCount) });

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



    // Scale the domains
    yBar.domain([0, 10]);
    yLine.domain([0, d3.max(data, function(d) { return d.reviewCount; })]);

    // Draw the yBarAxis
    svg.append('g')
        .attr('class', 'yAxis yBarAxis')
        .call(yBarAxis)
      .append('text')
        .attr('y', -12)
        .attr('x', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'start')
        .text('Rating');

    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0,'+(height)+')')


    /*
    // Draw the yLineAxis
    svg.append('g')
        .attr('class', 'yAxis yLineAxis')
        .attr('transform', 'translate('+(window.innerWidth - margin.right - 40)+',0)')
        .call(yLineAxis)
      .append('text')
        .attr('y', -12)
        .attr('x', -6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Reviews');
    */

    render();
    function render() {
      var visible = data.slice(index, index+bars);
      x.domain(visible.map(function(d, i){ return d.title; }));

      // Draw the bar graph
      var bargraph = svg.selectAll('.bar')
            .data(visible)

      bargraph.enter().append('rect')
          .attr('class', 'bar')
          .attr('width', x.rangeBand())
          .on('mouseover', showTooltip)
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip)

      bargraph
        .attr('x', function(d, i) { return x(d.title); })
        .attr('y', function(d) { return yBar(d.rating); })
        .attr('height', function(d) { return height - yBar(d.rating); })
        .attr('fill', function(d) { return color(d.genre); })

        /*
      // Draw the line graph
      var lines =  svg.selectAll('.line')
          .data(visible)
          .attr('d', line(visible))

      lines.enter().append('path').attr('class', 'line')
      lines.attr('d', line(visible));
      lines.exit().remove();

      svg.select('yLineAxis')
        .call(yLineAxis);
        */
    }

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

    // Offset data when mouse is scrolled
    $('#graph').bind('mousewheel', function(e, delta) {
      var scrollBy = -delta * scrollSpeed
      var newIndex = index + scrollBy;
      index = (newIndex >= 0 && newIndex < data.length - bars) ? newIndex: index;
      render();
    })

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
