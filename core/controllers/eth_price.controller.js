var async = require('async');
var logger = require('../../lib/logger.lib');
var request = require("request");

module.exports = function (req, res) {
    request.get("https://api.btctrade.com/api/ticker?coin=eth", function (err, response) {
        if (err) {
            res.json({error: true});
        } else {
            res.json(JSON.parse(response.body));
        }
    });
};

