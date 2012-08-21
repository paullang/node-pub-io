// Express initialization
var express = require('express');
var app = express.createServer(express.logger());
app.enable('jsonp callback');


// Redis initialization
if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}


// Routes
app.get('/recommendations/:id', function(req, res) {
	res.send(getRecommendations().recommendations[req.params.id]);
});

app.get('/recommendations/', function(req, res) {
	res.send( getRecommendations() );
});

app.post('/recommended', function(req,res) {
	var lastRecommendation = req.body;
	// TODO: Validate input from client
	client.set("lastRecommended", lastRecommendation, function(err, reply) {
	    res.send(reply);
	});
});

app.get('/recommended', function(req,res) {
	client.get("lastRecommended", function(err, reply) {
	    res.send(reply + err);
	});
});

app.get('/test.html',function(req, res) {
	res.sendfile('test.html');
});

// Helpers
function getRecommendations() {
	return {
		"recommendations": [
                            {"user" : "Paul", "value" : "#Olympics"},
                            {"user" : "Andrew", "value" : "#London2012"},
                            {"user" : "Lang", "value" : "#TeamUSA"},
                            {"user" : "@MarsCuriosity", "value" : "#MSL"}
                            ]
	};
}


// Server
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
