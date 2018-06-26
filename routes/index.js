var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
var result = sentiment.analyze('Cats are stupid.');
console.dir(result);    // Score: -2, Comparative: -0.666

var client = new Twitter({
  consumer_key: 'ejzFNi8pgJR0l6JPXYNLxTxFE',
  consumer_secret: 'c9ssVAqxeFi8yxSmiIvqjt8RdC0FX9xWTsvr3J6bWcCIPZ3HBs',
  access_token_key: '2247947534-GekPdxgYjamLaHTLgEZerGyISddw9lsPla8uroB',
  access_token_secret: 'o9FcA7TDjlJRJvEzvQ3osjcenfVedfLnKTWMemQY2Dgk7'
});

/* GET home page. */
router.get('/', function(req, res, next) {

  client.get('statuses/user_timeline', {screen_name: req.query.screen_name, count: 500}, function(error, tweets, response) {
     // tweets.statuses.forEach(tweet => {
     //   // console.log(tweet.text, tweet.user.name);
     //   console.log(tweet.user.name);
     // });
     let sentimentalTweets = [];
     tweets.forEach(tweet => {
       sentimentalTweets.push({text: tweet.text, analysis: sentiment.analyze(tweet.text)})
     });
     res.render('index', { title: 'something_else', tweets: sentimentalTweets, tweets2: JSON.stringify(tweets)});
  });
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  var tweets = [];
  client.get('statuses/user_timeline', {screen_name: req.body.user_id, count: 500}, function(error, tweets, response) {
    console.log(error === true, tweets === true, tweets.length);
    if(tweets.error){
      tweets = [];
    }
    console.log(tweets);
    console.log('tweets');
     let sentimentalTweets = [];
     tweets.forEach(tweet => {
       sentimentalTweets.push({text: tweet.text, analysis: sentiment.analyze(tweet.text)})
     });
     res.render('index', { title: 'something_else', tweets: sentimentalTweets, tweets2: JSON.stringify(sentimentalTweets)});
  });
});

module.exports = router;
