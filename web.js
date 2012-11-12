// Includes
var express		= require('express'),
	everyauth	= require('everyauth'),
    util		= require('util'),
    users       = require('./lib/users');
    
// everyauth initialization
everyauth.twitter
  .consumerKey(process.env.TWITTER_CONSUMER_KEY)
  .consumerSecret(process.env.TWITTER_CONSUMER_SECRET)
  .findOrCreateUser(function (session, accessToken, accessTokenSecret, twitterUser) {
     var promise = this.Promise();
     users.findOrCreateByTwitterData(twitterUser, accessToken, accessTokenSecret, promise);
     return promise;
  })
  .redirectPath('/');

// Express initialization
var app = express.createServer(
	express.logger()
    , express.bodyParser()
    , express.cookieParser()
    , express.session({secret: process.env.EXPRESS_SESSION_SECRET})
	, everyauth.middleware()
);
app.enable('jsonp callback');

everyauth.everymodule.findUserById(function (userId, callback) {
    users.findById(userId, callback);
});

// Redis initialization
if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

// Routes

// Gets a list of the last 10 recommendations
app.get('/recommendations/', function(req, res) {
    redis.lrange("recommendations", 0, 9, function(err, items) {
        var json = { "recommendations": [] };
        items.forEach(function (item) {
            json.recommendations.push({"value": item});
        });
        res.send(json);
    });
});

// Adds a recommendation to the front of the list and increases its score
app.post('/recommended/', function(req,res) {
	var recommendation = req.body.recommendation;  // TODO: Validate input from client
	redis.lpush("recommendations", recommendation, function(err, reply) {});
    redis.zincrby("topRecommendations", 1, recommendation, function(err, reply) {});
    res.send(200, {msg: "Received recommendation"});
});

// Gets the last received recommendation from the list
app.get('/recommended/', function(req,res) {
	redis.lindex("recommendations", 0, function(err, reply) {
	    res.send(reply);
	});
});

// Gets the top 10 recommendations by score
app.get('/topRecommendations/', function(req, res) {
    redis.zrevrange("topRecommendations", 0, 9, "withscores", function(err, items) {
        var json = { "topRecommendations": [] };
        for(var i=0; i < items.length; i+=2)
            json.topRecommendations.push({"value": items[i], "score": items[i+1]});
        res.send(json);
    });
});

// Home page
app.get('/', function(req, res){
	if(req.loggedIn)
    	res.send("Hello " +req.user.name + " <img src=" + req.user.twitterProfileImageUrl + ">");
    else
    	res.send("<a href='/auth/twitter'>Login with Twitter</a>");
});

// Server
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
