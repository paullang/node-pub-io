// Express initialization
var express = require('express');
var app = express.createServer(express.logger());
app.enable('jsonp callback');
app.use(express.bodyParser());


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


// Server
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
