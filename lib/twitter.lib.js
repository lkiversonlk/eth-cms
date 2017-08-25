var Twitter = require("twitter");

function Client(config, interval, callback){
    this.t = new Twitter(config);
    this.interval = interval;
    this.callback = callback;
    this.actionBotId = "859350218416029696";
    this.since_id = null;
    //this.loop();
}

Client.prototype.fetch = function (since_id, callback) {
    var self = this;
    var params = {
        user_id : self.actionBotId
    };

    if(since_id){
        params.since_id = since_id;
    }

    self.t.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error && tweets.length > 0) {
            return callback(null, {
                t: tweets.map(function (tweet) {
                    return tweet.text;
                }),
                i: tweets[0].id}
            );
        } else {
            console.log("ERROR: " + error);
            callback("error");
        }
    });
};

Client.prototype.loop = function () {
    var self = this;
    var params = {
        user_id : self.actionBotId
    };

    if(self.since_id){
      params.since_id = self.since_id;
    }

    self.t.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error && tweets.length > 0) {
            self.since_id = tweets[0].id;
            self.callback(tweets.map(function (tweet) {
                return tweet.text;
            }));
        }
        setTimeout(self.loop.bind(self), self.interval);
    });


};

module.exports = Client;



