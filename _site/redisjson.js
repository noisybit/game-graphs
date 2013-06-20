var redis = require('redis');
var db = redis.createClient();
var games = [];
var unrated = [];

function getRecord(index, cb) {
  db.hgetall('games:id:'+index, function(err, g) {
    if(err) return cb(err);
    if(!g) return cb(null);

    //Seperate rated from unrated
    (g.rating !== 'NaN')
    ? games.push(g)
    : unrated.push(g);

    cb(null);
  })
}

db.get('db.recordCount', function(err, count) {
  var i = 0;
  getRecord(i, recordCallback)
  function recordCallback(err) {
    if(i++ < count) {
      console.log(i)
      getRecord(i, recordCallback)
    } else {
      var fs = require('fs');
      var gs = JSON.stringify(games);
      var us = JSON.stringify(unrated);

      fs.writeFile('./data/rated.json', gs, function(err) {
        if(err) throw err;
        console.log('Saved %d records to rated.json', games.length);
        fs.writeFile('./data/unrated.json', us, function(err) {
          console.log('Saved %d records to unrated.json', unrated.length);
        })
      })
    }
  }

})
