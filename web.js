var express = require('express');

var app = express.createServer(express.logger());

app.get('/recommendations/1', function(req, res) {
	/*
	var r = getRecommendations().recommendations;
	var id = req.params.id;
	var idx = Integer.parseInt(id >= 0 && id < r.length ? id : 0);
	res.send( r[id] );
	*/
	res.send(getRecommendations().recommendations[1])
});

app.get('/recommendations/', function(request, response) {
	response.send( getRecommendations() );
});

function getRecommendations() {

	return {
		"recommendations": [
				{"user" : "joel", "value" : "#London2012"},
				{"user" : "paul", "value" : "#TeamUSA"},
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
