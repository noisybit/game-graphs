$(function() {
  var margin = {top: 20, right: 40, bottom: 20, left: 25};
  var width = window.innerWidth - margin.left - margin.right;
  var height = (window.innerHeight / 2)- margin.top - margin.bottom;
  var barWidth = Math.floor(width / 30) - 1
  var offset = 0;

  var color = d3.scale.category10();

  var svg = d3.select('#graph')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


  d3.json('/data/rated.json', function(err, data) {

    width = data.length * barWidth;

    var x = d3.scale.ordinal()
        .rangeBands([0, width], .1, 0.7);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .tickFormat(d3.format())

    data = data.sort(function(a, b) {
      return b.reviewCount - a.reviewCount;
    })

    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviewCount = +d.reviewCount;
    })

    x.domain(data.map(function(d, i) { return d.title}));
    y.domain([0, d3.max(data, function(d) { return d.rating })]);


   svg.selectAll('.bar')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.title) + offset})
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d.rating); })
        .attr('height', function(d) { return height - y(d.rating); })
        .attr('fill', function(d,i) { return color(i) })
        .on('click', viewGame)
        .append('svg:title')
        .text(function(d) {
          return 'Title: '+d.title+'\n'
          + 'Rating: ' +d.rating+'\n'
          + 'Reviewers: '+d.reviewCount
        })

    /* Remove x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'start')
          .attr('transform', 'rotate(65)')
    */

   svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Rating');

    $('#graph').bind('mousewheel', function(e, delta) {
      var updated = offset + (delta * 65);
      offset = updated > 0 || updated < -width ? offset : updated;
      console.log(offset, delta)
      drawGraph();
    })

    function drawGraph() {
      svg.selectAll('.bar')
          .data(data)
        .attr('x', function(d) { return x(d.title) + offset})
    }

    function viewGame(d) {
      $info = $('#gameInfo');
      $info.find('#title').html(d.title);
      $info.find('#boxart').attr('src', d.boxart);
      $info.find('#rating').html(d.rating);
      $info.find('#reviews').html(d.reviewCount);
    }
  })

})
