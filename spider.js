var spider = require('spider');
var redis = require('redis');
var db = redis.createClient();

spider()
.route('www.gamefaqs.com', /\/snes\/list-999\?page=\d+/, function(window, $) {
  $('a').spider();
})
.route('www.gamefaqs.com', /\/snes\/\d+[-\w]+$/, function(window, $) {
  var game = { title: $('.page-title').find('a').text() };

  var $rating = $('.score').eq(1);
  game.rating = parseFloat($rating.text(), 10);
  if(game.rating === NaN)
    game.rating = null;

  //Number of reviews
  game.reviewCount = (game.rating === null)
  ? null
  : $rating.next('a').text().split(' ')[1]

  game.boxart = $('img.boxshot').attr('src');
  game.release = $('.pod_gameinfo li').eq(3).find('a').text().slice(0, -2);
  game.genre = $('.crumb a').eq(1).text();

  db.incr('db.recordCount', function(err, key) {
    db.hmset('games:id:'+key, game, function(err) {
      console.log('%s - %s - %d - %d', game.title, game.release, game.rating, game.reviewCount);
      window.close();
    });
  })
})
.get('http://www.gamefaqs.com/snes/list-999\?page=0')
.log('error')
