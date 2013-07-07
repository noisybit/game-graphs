var fs = require('fs');
var spider = require('spider');
var records = [];
var system = process.argv[2] || 'snes';
var categoryAll = new RegExp('/'+system+"/list-999\\?page=\\d+");
var gameOverview = new RegExp('/'+system+"/\\d+[-\\w]+$");

spider()
  .route('www.gamefaqs.com', categoryAll, function(window, $) {
    $('a').spider();
    window.close();
  })
  .route('www.gamefaqs.com', gameOverview, function(window, $) {

    var game = {}
    var $rating = $('.score').eq(1);
    game.rating = parseFloat($rating.text(), 10);

    // No reviews :( - DO NOT WANT!
    if(isNaN(game.rating))
      return window.close();

    game.reviews = $rating.next('a').text().split(' ')[1];
    game.title = $('.page-title').find('a').text();
    game.boxart = $('img.boxshot').attr('src');
    game.release = $('.pod_gameinfo li').eq(3).find('a').text().slice(0, -2);
    game.genre = $('.crumb a').eq(1).text();
    game.subgenre = $('.crumb a').eq(2).text();
    game.href = 'http://www.gamefaqs.com' + $('.page-title').find('a').attr('href');

    records.push(game);
    log(game);
    window.close();
  })
  .get('http://www.gamefaqs.com/'+system+'/list-999\?page=0')
  .log('error');

process.on('exit', function() {
  console.log('Process terminating...')
  var data = {
    system: system,
    timestamp: Date.now(),
    records: records
  };
  var str = JSON.stringify(data);
  var filename = __dirname+'/data/'+system+'.json';

  if(records.length) {
    fs.writeFileSync(filename, str, 'utf8');
    console.log('%d records saved!', records.length);
  }
})

process.on('SIGINT', function(){ process.exit() });

function log(game) {
  var msg = game.rating + '/10';
  msg += ' \"'+ (game.title.length > 50 
                ? game.title.slice(0, 47) + '...'
                : game.title) + '\"';
  msg += ' ['+game.genre+']['+game.subgenre+']';
  console.log(msg);
}
