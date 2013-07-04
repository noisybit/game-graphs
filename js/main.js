graph = (function(graph) {
  graph.color = d3.scale.category10();

  var $tooltip = $('#tooltip');
  graph.showTooltip = function (d) {
    $tooltip.find('#title').html(d.title);
    $tooltip.find('.game-boxart').attr('src', d.boxart);
    $tooltip.find('.game-rating').html(d.rating);
    $tooltip.find('.game-reviews').html(d.reviews);
    $tooltip.show();
  }

  graph.hideTooltip = function() {
    $tooltip.hide()
  }

  graph.moveTooltip = function() {
    var yOffset = d3.event.pageY-10;
    var xOffset = d3.event.pageX+10;
    var width = $tooltip[0].scrollWidth;
    if(width + xOffset > window.innerWidth) 
      $tooltip.css('top', yOffset+"px").css('left', (xOffset - 20 - width)+"px")
    else
      $tooltip.css('top', yOffset+"px").css('left', xOffset+"px")
  }

  graph.init = function(json) {
    var data = json.records;
    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviews = +d.reviews;
    })

    // Sort
    var sorted= graph.sorted = {
      reviews: data.slice(0),
      ratings: data.slice(0).sort(function(a, b){ return b.rating - a.rating})
    };

    sorted.reviews.sort(function(a, b) {
      var reviews = b.reviews - a.reviews;
      return (reviews === 0) ? b.rating - a.rating : reviews;
    })

    var slider = {
      reviews: [],
      ratings: []
    }
    //
    // Get all unique values
    sorted.reviews.forEach(function(d) {
      if(slider.reviews.indexOf(d.reviews) < 0)
        slider.reviews.push(d.reviews);
    })

    // Get all unique values
    sorted.ratings.forEach(function(d) {
      if(slider.ratings.indexOf(d.rating) < 0)
        slider.ratings.push(d.rating);
    })

    var filter = graph.filter = {
      reviews: [slider.reviews[100], slider.reviews[0]],
      ratings: [slider.ratings[40], slider.ratings[0]],
      genre: []
    };


    $(document).ready(function() {

      graph.reviews = graph.bargraph({
        svg: '#reviews',
        xLabel: 'Reviews',
        yLabel: 'Ratings',
        xSelector: 'reviews',
        yMax: 'rating',
        yInput: 'rating'
      });

      graph.ratings = graph.bargraph({
        svg: '#ratings',
        xLabel: 'Ratings',
        yLabel: 'Reviews',
        xSelector: 'rating',
        yMax: 'reviews',
        yInput: 'reviews'
      });

      $('#reviewSlider')
        .slider({range: true, values: [0, 100], min: 0, max: slider.reviews.length-1})
        .on('slide', function(e, ui) {
          filter.reviews[0] = slider.reviews[ui.values[1]]; // Min
          filter.reviews[1] = slider.reviews[ui.values[0]]; // Max
          $('h3.review').html(writeRange(filter.reviews[1], filter.reviews[0], 'Reviews'));
          render();
        });

      $('#ratingSlider')
        .slider({range: true, values: [0, 40], min: 0, max: slider.ratings.length-1})
        .on('slide', function(e, ui) {
          filter.ratings[0] = slider.ratings[ui.values[1]]; // Min
          filter.ratings[1] = slider.ratings[ui.values[0]]; // Max
          $('h3.rating').html(writeRange(filter.ratings[1], filter.ratings[0], 'Ratings'));
          render();
        })

      $('h3.review').html(writeRange(filter.reviews[1], filter.reviews[0], 'Reviews'));
      $('h3.rating').html(writeRange(filter.ratings[1], filter.ratings[0], 'Ratings'));

      render();
    });

    function render() {
      graph.reviews.render(sorted.reviews.filter(filterData));
      graph.ratings.render(sorted.ratings.filter(filterData));
    }

    function filterData(d) {
      return d.reviews >= filter.reviews[0]
          && d.reviews <= filter.reviews[1]
          && d.rating >= filter.ratings[0]
          && d.rating <= filter.ratings[1]
          && filter.genre.indexOf(d.genre) < 0;
    }

    function writeRange(max, min, label) {
      return max + ' &#8805; '+ label + ' &#8805; ' + min;
    }

    var lWidth = 500;
    var lHeight = 100;
    var legendColors = graph.color.domain();

    // Draw the legend
    var legend = d3.select('.legend')
          .attr('width', lWidth)
          .attr('height', lHeight);

    var nodes = legend.selectAll('g')
          .data(legendColors)
          .enter()
            .append('g')
              .attr('class', 'genre-color')
              .attr('transform', function(d, i) {
                var x = Math.floor(i % 2) * (lWidth / 2);
                var y = Math.floor(i / 2) * (lHeight / legendColors.length * 2) ;
                return 'translate('+ x +', '+ y +')';
               })
               .on('click', toggleGenre)

    nodes.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', function(d){ return graph.color(d) })

    nodes.append('text')
          .attr('x', 13)
          .attr('dy', '.71em')
          .style('text-anchor', 'start')
          .text(function(d){ return d; });

    function toggleGenre(genre) {
      var index = filter.genre.indexOf(genre);
      (index < 0) ? filter.genre.push(genre) : filter.genre.splice(index, 1);
      d3.select(this).classed('strike')
        ? d3.select(this).classed('strike', false)
        : d3.select(this).classed('strike', true)
      render();
    }
  };

  return graph;

}(graph || {}))
