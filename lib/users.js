
var cradle = require('cradle'),
    util   = require('util');

var c = new cradle.Connection(process.env.COUCH_HOST, process.env.COUCH_PORT, {
    auth: {
        username: process.env.COUCH_USER,
        password: process.env.COUCH_PASS
    }
});

var users = c.database('users');

// Lookup the user by internal document id
exports.findById = function (userId, callback) {
	users.get(userId, function (err, doc) {
      callback(err,doc);
  });
}

// Lookup the user by twitterId
exports.findOrCreateByTwitterData = function (twitterUserData, accessToken, accessTokenSecret, promise) {
    users.view('docs/twitterId', { key: twitterUserData.id }, function (err, docs) {
    
        if (err) {
            console.log('Error using users/_design/docs/_view/twitterId:');
            console.log(err);
            promise.fail(err);
            return;
        }
        if (docs.length > 0) {
            var user = docs[0].value;
            user.id = user._id; // Express & everyauth looks for id, but couch auto assigns _id
            //console.log('user exists: ' + util.inspect(user));
            promise.fulfill(user);
        } else {
        	//console.log('user does not exist yet, so going to create');
            var doc = {
                name: twitterUserData.name,
                twitterId: twitterUserData.id,
                twitterScreenName: twitterUserData.screen_name,
                twitterProfileImageUrl: twitterUserData.profile_image_url
            };
            
            c.database('users').save(doc, function (err, res) {
                if (err) {
                    console.log('Error using users:');
                    console.log(err);
                    promise.fail(err);
                    return;
                }
                doc.id = res.id; // Express & everyauth looks for id, but couch auto assigns _id
                promise.fulfill(doc);
            });
        }

    });
}
