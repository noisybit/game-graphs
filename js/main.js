graph = (function(graph) {
  graph.color = d3.scale.category10();

  // initialize with the dataset
  graph.init = function(json) {
    var data = json.records;
    var g = d3.map();

    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviews = +d.reviews;

      var key = d.genre;
      var sub = d.subgenre;
      if(!g.has(key))
        g.set(key, []);

      var arr = g.get(key);
      if(arr.indexOf(sub) < 0) {
        arr.push(sub);
        g.set(key, arr);
      }
    })

    // Clone data for sorting
    var sorted = graph.sorted = {};
    sorted.reviews = data.slice(0);
    sorted.ratings = data.slice(0);

    // Sort by reviews, then by rating
    sorted.reviews.sort(function(a, b) {
      var reviews = b.reviews - a.reviews;
      return (reviews === 0) ? b.rating - a.rating : reviews;
    })

    // Sort by rating, then by reviews
    sorted.ratings.sort(function(a, b) {
      var rating = b.rating - a.rating;
      return (rating === 0) ? b.reviews - a.reviews : rating;
    })

    // Setup the controls
    var controls = graph.controls = {};

    // Setup the slider unique values
    var slider = controls.slider = {};
    slider.reviews = [];
    slider.ratings = [];

    // Fill slider.reviews with unique values
    sorted.reviews.forEach(function(d) {
      if(slider.reviews.indexOf(d.reviews) < 0)
        slider.reviews.push(d.reviews);
    })

    // Fill slider.ratings with unique values
    sorted.ratings.forEach(function(d) {
      if(slider.ratings.indexOf(d.rating) < 0)
        slider.ratings.push(d.rating);
    })

    // Setup the genre state
    var genre = graph.controls.genre = {};

    // onSlide
    controls.onSlide = function(e, ui) {
      var $h3 = $(this).prev();
      var label = $h3.find('.slider-label').text().toLowerCase();
      var unique = slider[label];   
      var lower = unique[ui.values[1]];
      var upper = unique[ui.values[0]];
      filter[label] = [lower, upper]
      $h3.find('.lower').text(lower);
      $h3.find('.upper').text(upper);
      graph.render();
    };

    // Slider initial lower bounds
    var top25 = Math.floor(.25 *  slider.reviews.length);
    var top15 = Math.floor(.15 *  slider.reviews.length);

    // Setup the data filter
    var filter = graph.filter = {};
    filter.genre = [];
    filter.reviews = [slider.reviews[top25], slider.reviews[0]];
    filter.ratings = [slider.ratings[top15], slider.ratings[0]];
    filter.execute = function (d) {
      return d.reviews >= filter.reviews[0]
          && d.reviews <= filter.reviews[1]
          && d.rating >= filter.ratings[0]
          && d.rating <= filter.ratings[1]
          && filter.genre.indexOf(d.genre) < 0;
    }


    // Render both graphs
    graph.render = function() {
      graph.reviews.render(sorted.reviews.filter(filter.execute));
      graph.ratings.render(sorted.ratings.filter(filter.execute));
    }

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

      $('.control-reviews .slider').slider({
        range: true,
        values: [0, 100],
        min: 0,
        max: slider.reviews.length-1
      }).on('slide', controls.onSlide);

      $('.control-ratings .slider').slider({
        range: true,
        values: [0, 40], 
        min: 0, 
        max: slider.ratings.length-1
        }).on('slide', controls.onSlide);

      graph.render();
    });


    // Setup the genres
    var li = d3.select('.control-genres ul')
        .selectAll('li')
        .data(g.entries())
        .enter()
          .append('li')
          .attr('class', 'genre')
          .on('click', toggleGenre)

    li.insert('div')
            .attr('class', 'genre-color')
            .attr('style', function(d) { return 'background-color: '+graph.color(d.key)+';'; })

    li.append('text')
      .text(function(d){ return d.key;})

    li.append('ul')
      .attr('class', 'genre-subgenre')

    // subgenres
    li.select('ul').selectAll('li')
      .data(function(d){ return d.value;})
      .enter()
        .append('li')
        .attr('class', 'subgenre')
        .on('click', toggleGenre)
        .append('text')
          .text(function(d) { return d})
      

    function toggleGenre(genre) {
      var index = filter.genre.indexOf(genre);
      (index < 0) ? filter.genre.push(genre) : filter.genre.splice(index, 1);
      d3.select(this).classed('strike')
        ? d3.select(this).classed('strike', false)
        : d3.select(this).classed('strike', true)
      graph.render();
    }
  };

  var $tooltip = $('#tooltip');
  graph.showTooltip = function (d) {
    $tooltip.find('.game-title').html(d.title);
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

  return graph;

}(window.graph || {}))
