var apicache = require("apicache");
var cache = apicache.middleware;

module.exports = cache('5 minutes');