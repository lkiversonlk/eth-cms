/**
 * Created by surface on 2017/9/17.
 */
var async = require("async");
var request = require("request");

function coinbasePrice(req, res, next) {
    var coins = ["BTC", "ETH", "LTC"];
    async.map(coins,
        function (coin, callback) {
            request.get("https://api.coinbase.com/v2/prices/" + coin + "-USD/sell", function (err, response, body) {
                if(err){
                    console.log("get coinbase price error", err);
                    return callback(err)
                } else {
                    try{
                        var result = JSON.parse(body);
                        return callback(null, parseFloat(result.data.amount));
                    } catch (error) {
                        return callback(error)
                    }
                }
            });
        },
        function (err, results) {
            if(err){
                res.sendStatus(500)
            } else {
                res.json(results);
            }
        }
    );
};

module.exports = coinbasePrice;