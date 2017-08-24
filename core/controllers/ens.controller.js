var async = require('async');
var logger = require('../../lib/logger.lib');

module.exports = function (req, res) {
    var ethereum = req.app.get("ethereum");

    res.json(ethereum.eth.accounts);
};

