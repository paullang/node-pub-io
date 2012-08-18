var express = require('express');

var app = express.createServer(express.logger());
app.enable('jsonp callback');

app.get('/recommendations/:id', function(req, res) {
	res.send(getRecommendations().recommendations[req.params.id]);
});

app.get('/recommendations/', function(req, res) {
	res.send( getRecommendations() );
});

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

app.post('/recommended', function(request,response) {
	// TODO: Validate input from client
	lastRecommended = request.body;
	lastRecommended = "#posted"
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
