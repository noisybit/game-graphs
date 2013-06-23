$(function() {
  var margin = {top: 20, right: 40, bottom: 20, left: 25};
  var barWidth = Math.floor(window.innerWidth / 100) - 1
  var height = (window.innerHeight / 2)- margin.top - margin.bottom;
  var color = d3.scale.category10();
  var scrollSpeed = 60;

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

  // Grab the data
  d3.json('/data/rated.json', function(err, data) {

    var width = (data.length * barWidth) - margin.left - margin.right;

    // Create the graph and offset by margins
    var svg = d3.select('#graph')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create the x scale
    var x = d3.scale.ordinal()
        .rangeBands([0, width], .1, 0.7);

    // Setup the line graph
    var line = d3.svg.line()
        .x(function(d) { return x(d.title) })
        .y(function(d) { return yLine(d.reviewCount) });

    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviewCount = +d.reviewCount;
    })

    // Sort by number of reviews
    data = data.sort(function(a, b) {
      return b.reviewCount - a.reviewCount;
    })

    // Scale the domains
    x.domain(data.map(function(d, i) { return d.title; }));
    yBar.domain([0, d3.max(data, function(d) { return d.rating; })]);
    yLine.domain([0, d3.max(data, function(d) { return d.reviewCount; })]);

    // Draw the bar graph
    svg.selectAll('.bar')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.title); })
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return yBar(d.rating); })
        .attr('height', function(d) { return height - yBar(d.rating); })
        .attr('fill', function(d) { return color(d.genre); })
        .on('mouseover', viewGame)
        .append('svg:title')
        .text(function(d) {
          return 'Title: '+d.title+'\n'
          + 'Rating: ' +d.rating+'\n'
          + 'Reviewers: '+d.reviewCount
          + 'Genre: '+d.genre
        })

    // Draw the line graph
    svg.append('path')
          .attr('class', '.line')
          .attr('d', line(data));

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

    $('#graph').bind('mousewheel', function(e, delta) {
      var x = window.scrollX || window.screenLeft;
      var y = window.scrollY || window.screenTop;
      var scroll = (-delta * scrollSpeed);

      // Move the screen
      window.scrollTo(x + scroll, y);

      //Move the yAxis
      svg.select('.yBarAxis')
          .attr('transform', function(){ return 'translate('+(x+scroll)+', 0)'})

      svg.select('.yLineAxis')
          .attr('transform', function(){ return 'translate('+(window.innerWidth - margin.right - 40 + x + scroll)+',0)';})
    })

    function viewGame(d) {
      $info = $('#gameInfo');
      $info.find('#title').html(d.title);
      $info.find('#boxart').attr('src', d.boxart);
      $info.find('#rating').html(d.rating);
      $info.find('#reviews').html(d.reviewCount);
    }
  })

})
