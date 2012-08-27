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
app.get('/recommendations/', function(req, res) {
    redis.lrange("recommendations", 0, 9, function(err, items) {
        var json = { "recommendations": [] };
        var r = json.recommendations;
        items.forEach(function (item) {
            r.push({"value": item});
        });
        res.send(json);
    });
});

app.post('/recommended/', function(req,res) {
	var lastRecommendation = req.body.recommendation;
	// TODO: Validate input from client
	redis.lpush("recommendations", lastRecommendation, function(err, reply) {
	    res.send(reply);
	});
});

app.get('/recommended/', function(req,res) {
	redis.lindex("recommendations", 0, function(err, reply) {
	    res.send(reply);
	});
});

app.get('/test.html',function(req, res) {
	res.sendfile('test.html');
});


// Server
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
