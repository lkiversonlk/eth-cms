var async = require('async');
var logger = require('../../lib/logger.lib');




var status = [
    "尚未注册",
    "正在竞拍",
    "已被注册",
    "禁止注册",
    "公示阶段",
    "尚未放出"
];

module.exports = function (req, res) {
    var ethereum = req.app.get("ethereum");
    var ens = req.app.get("ens");
    var domain = req.query.domain;
    console.log("try to parse " + domain + " length " + domain.length);

    function getDomainInfo(d) {
        var entry = ens.ethRegistrar.entries(ethereum.sha3(d));
        var status_int = parseInt(entry[0]);
        var address = entry[1];
        var date = new Date(parseInt(entry[2]) * 1000);
        var highestBid = ethereum.fromWei(entry[4], "ether");
        var secondBid = ethereum.fromWei(entry[3], "ether");
        var status_ch = status[status_int];
        var ret = {
            sti : status_int,
            deed: address,
            date: date,
            stch : status_ch,
            high : highestBid,
            sec : secondBid
        };

        if(status_int == 2){
            var owner_addr = ens.ens.owner(ens.namehash(d+".eth"))
            if(owner_addr == '0x0000000000000000000000000000000000000000'){
                return {
                    sti : status_int,
                    deed: address,
                    date: date,
                    stch : "等待领取",
                    high : highestBid,
                    sec : secondBid
                };
            }
        }
        return ret;
    }

    res.json(getDomainInfo(domain));
};

