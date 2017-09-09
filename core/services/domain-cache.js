var async = require("async");

function DomainCache(ldb){
    this.ldb = ldb;
    this.cache = [];
    this.code_a = "a".charCodeAt(0);
    for(var i = 0; i <= 26; i++){
        this.cache[i] = {}

    }
}

DomainCache.prototype.init = function () {
    var self = this;
    self.loop();
    setInterval(self.loop.bind(self), 60 * 1000);
};

var MAX_DOMAIN = 2000;

DomainCache.prototype.loop = function () {
    var self = this;
    var iterator = self.ldb.iterator({values: false});
    async.timesSeries(
        MAX_DOMAIN,
        function (i, callback) {
            iterator.next(function (err, key, value) {
                //we ignore the value
                if(err) {
                    console.log("iterate on leveldb fail: " + err);
                    return callback(err);
                } else {
                    if(!key){
                        //we meet the end
                        return callback("finished");
                    } else {
                        self.insert(key);
                        return callback();
                    }
                }
            })
        },
        function (err) {
            if(err) {
                console.log("iteration finished with :" + err);
            } else {
                console.log("iteration success");
            }
        }
    );
};

DomainCache.prototype.insert = function (domain) {
    var self = this;
    if(domain && domain.length >= 7){
        domain = domain.toString();
        var index = domain.charAt(0).charCodeAt(0) - self.code_a;
        if(!(index >= 0 && index <26)) {
            //special character
            index = 26;
        }
        if(!(domain in self.cache[index])) {
            self.cache[index][domain] = true;
        }
        return
    } else {
        return
    }
};

DomainCache.prototype.all = function () {
    return this.cache
};

module.exports = DomainCache;