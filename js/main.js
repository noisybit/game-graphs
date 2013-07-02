var GRAPH = (function(graph) {

  d3.json('/data/rated.json', function(err, data) {

    // Convert strings to numbers
    data.forEach(function(d) {
      d.rating = +d.rating;
      d.reviewCount = +d.reviewCount;
    })

    // Sort by number of reviews
    var reviews;
    var rating;
    var sortByReviews = data.sort(function(a, b) {
      reviews = b.reviewCount - a.reviewCount;
      // if equal reviewCount, sort by rating
      if(reviews === 0)
        return b.rating - a.rating;
      else
        return reviews;
    })

    // Sort by rating then by reviews
    var sortByRatings = sortByReviews.slice(0).sort(function(a, b) {
      rating = b.rating - a.rating;
      // if equal reviewCount, sort by rating
      if(rating === 0)
        return b.reviewCount - a.reviewCount;
      else
        return rating;
    })


    var mostReviews = d3.max(data, function(d){ return d.reviewCount;})
    var mostRatings  = 10;
    var review = {max: mostReviews,  min: 0};
    var rating = {max: mostRatings, min: 0}



    $(document).ready(function() {
      var $review = $('#reviewSlider').slider({range: true, values: [0, 10]})
        .on('slide', function(e, ui) {
          var max = Math.floor(ui.values[0]/100 * (sortByReviews.length -1))
          var min = Math.floor(ui.values[1]/100 * (sortByReviews.length -1))
          console.log(max, min, sortByReviews.length, ui.values)
          review.max = sortByReviews[max].reviewCount;
          review.min = sortByReviews[min].reviewCount;
          $('h3.review').html(review.max+' > reviews > '+review.min);
          render();
        });

      var $rating = $('#ratingSlider').slider({range: true, values: [0, 10]})
        .on('slide', function(e, ui) {
          rating.max = sortByRatings[Math.floor(ui.values[0]/100 * (sortByRatings.length -1))].rating;
          rating.min = sortByRatings[Math.floor(ui.values[1]/100 * (sortByRatings.length -1))].rating;
          $('h3.rating').html(rating.max+' > ratings > '+rating.min);
          render();
        })

      $('h3.rating').html(rating.max+' > ratings > '+rating.min);
      $('h3.review').html(review.max+' > reviews > '+review.min);

      render();
    })

    function render() {
      graph.sortByRatings(sortByRatings.filter(function(d){ 
        return d.reviewCount >= review.min && d.reviewCount <= review.max
               && d.rating >= rating.min && d.rating <= rating.max;
      }));

      graph.sortByReviews(sortByReviews.filter(function(d){ 
        return d.reviewCount >= review.min && d.reviewCount <= review.max
               && d.rating >= rating.min && d.rating <= rating.max;
      }));
    }

  })

  return graph;

}(GRAPH || {}))
