graph = (function(graph) {
  graph.color = d3.scale.category10();
  graph.color.domain([
    "Action",           "Role-Playing",
    "Action Adventure", "Strategy",
    "Driving",           "Sports",
    "Simulation",         "Hardware", 
    "Miscellaneous",       "Adventure"
  ]);

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
      if(label === 'score') label = 'ratings'
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
    filter.subgenre = [];
    filter.reviews = [slider.reviews[top25], slider.reviews[0]];
    filter.ratings = [slider.ratings[top15], slider.ratings[0]];
    filter.execute = function (d) {
      return d.reviews >= filter.reviews[0]
          && d.reviews <= filter.reviews[1]
          && d.rating >= filter.ratings[0]
          && d.rating <= filter.ratings[1]
          && filter.genre.indexOf(d.genre) < 0
          && filter.subgenre.indexOf(d.subgenre) < 0;
    }


    // Render both graphs
    graph.render = function() {
      graph.reviews.render(sorted.reviews.filter(filter.execute));
      graph.ratings.render(sorted.ratings.filter(filter.execute));
    }

    $(document).ready(function() {

      graph.reviews = graph.bargraph({
        svg: '#reviews',
        xLabel: '# of Reviews',
        yLabel: 'Score',
        xSelector: 'reviews',
        yMax: 'rating',
        yInput: 'rating'
      });

      graph.ratings = graph.bargraph({
        svg: '#ratings',
        xLabel: 'Score',
        yLabel: '# of Reviews',
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

      // Set the initial bounds
      $('.control-reviews').find('.lower').text(filter.reviews[0]);
      $('.control-reviews').find('.upper').text(filter.reviews[1]);
      $('.control-ratings').find('.lower').text(filter.ratings[0]);
      $('.control-ratings').find('.upper').text(filter.ratings[1]);

      $(window).resize(function() {
        graph.reviews.resize();
        graph.ratings.resize();
        graph.render();
      })

      graph.render();

      d3.selectAll('svg')
          .on('touchstart', graph.touchstartTooltip)
          .on('touchmove', graph.touchmoveTooltip)
          .on('touchend', graph.touchendTooltip)


    });


    // Setup the genres
    var li = d3.select('.control-genres ul')
        .selectAll('li')
        .data(graph.color.domain())
        .enter()
          .append('li')
          .attr('class', 'genre')

    li.insert('div')
            .attr('class', 'genre-color')
            .attr('style', function(d) { 
              return 'background-color: '+graph.color(d)+';'; 
            })

    li.append('text')
      .text(function(d){ return d;})
      .on('click', toggleGenre)
      .on('mouseover', function() {
        $(this).attr('style', 'text-decoration: line-through;')
      })
      .on('mouseout', function() {
        $(this).attr('style', '');
      })

    // Sort subgenres by length
    var s = g.entries().sort(function(a, b) {
      return b.value.length - a.value.length
    })

    // Setup the subgenre controls
    var subul = d3.select('.control-subgenres')
          .selectAll('ul')
          .data(s)
            .enter()
              .append('ul')

    var sub = subul.selectAll('li')
          .data(function(d) {
            return d.value.map(function(s) {
              return {name: s, parent: d.key};
            })
          })
          .enter()
          .append('li')
          .attr('class', 'subgenre')


    sub.insert('div')
        .attr('class', 'genre-color')
        .attr('style', function(d){ 
          return 'background-color: '+graph.color(d.parent)+';';
        })

    sub.append('text')
      .text(function(d){
        return d.name;
      })
      .on('click', toggleSubgenre)
      .on('mouseover', function() {
        $(this).attr('style', 'text-decoration: line-through;')
      })
      .on('mouseout', function() {
        $(this).attr('style', '');
      })

    function toggleGenre(d) {
      var index = filter.genre.indexOf(d);
      (index < 0)
        ? filter.genre.push(d)
        : filter.genre.splice(index, 1);
      $(this).toggleClass('strike');
      graph.render();
    }

    function toggleSubgenre(d) {
      var index = filter.subgenre.indexOf(d.name);
      (index < 0)
        ? filter.subgenre.push(d.name)
        : filter.subgenre.splice(index, 1);
      $(this).toggleClass('strike');
      graph.render();
    }
  };

  var $tooltip = $('#tooltip');
  var timeout;
  graph.showTooltip = function (d) {
    $tooltip.find('.game-title').html(d.title);
    timeout = setTimeout(function() {
      $tooltip.find('.game-boxart').attr('src', d.boxart);
    }, 25);
    $tooltip.find('.game-rating').html(d.rating);
    $tooltip.find('.game-reviews').html(d.reviews);
    $tooltip.show();
  }

  graph.hideTooltip = function() {
    clearTimeout(timeout);
    $tooltip.hide()
  }

  graph.moveTooltip = function(above) {
    var width = $tooltip[0].scrollWidth;
    var height = $tooltip[0].scrollHeight;
    var yOffset = d3.event.pageY - height;
    var xOffset = d3.event.pageX+10;
    if(width + xOffset > window.innerWidth) 
      $tooltip.css('top', yOffset+"px").css('left', (xOffset - 20 - width)+"px")
    else
      $tooltip.css('top', yOffset+"px").css('left', xOffset+"px")
  }

  graph.touchstartTooltip = function(d, i) {
    $tooltip.show();
  }

  graph.touchmoveTooltip = function(d, i) {
    var touches = d3.touches(this);
    var svg = $(this);
    var bar = svg.find('.bar');
    var width = svg.attr('width');
    var x = touches[0][0];
    if(touches.length > 1 || x > width) return; //multi-touch event
    var el = bar[Math.floor(x/(width/bar.length))];
    var d = d3.select(el).datum()
    $tooltip.find('.game-title').html(d.title);
    timeout = setTimeout(function() {
      $tooltip.find('.game-boxart').attr('src', d.boxart);
    }, 25);
    $tooltip.find('.game-rating').html(d.rating);
    $tooltip.find('.game-reviews').html(d.reviews);
    $tooltip.show();

    graph.moveTooltip(true);
  }

  graph.touchendTooltip = function(d, i) {
    console.log('TouchEnd')
    $(document).on('touchstart', function(e) {
      $tooltip.hide();
      $(this).off(e);
    })
  }

  return graph;

}(window.graph || {}))
