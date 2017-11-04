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

var resolveStatus = [
    "未设置解析",
    "官方解析器",
    "私有解析器"
];

module.exports = function (req, res) {
    var ethereum = req.app.get("ethereum");
    var ens = req.app.get("ens");
    var publicResolver = ens.publicResolver;
    var domain = req.query.domain;
    console.log("try to parse " + domain + " length " + domain.length);

    function getDomainInfo(d) {
        var dHash = ethereum.sha3(d);
        var entry = ens.ethRegistrar.entries(dHash);
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
                ret = {
                    sti : status_int,
                    deed: address,
                    date: date,
                    stch : "等待领取",
                    high : highestBid,
                    sec : secondBid
                };
            }
        }

        ret.resolve = {
            status: 0,
            resolveTo: "0x0000000000000000000000000000000000000000",
            resolver: "0x0000000000000000000000000000000000000000"
        };
        //resolver
        ret.resolver = ens.ens.resolver(dHash);

        if(ret.resolver != '0x0000000000000000000000000000000000000000') {
            //
            if(ret.resolverAddress() == publicResolver.address){
                ret.status = 1;
                ret.resolveTo = publicResolver.addr(dHash);
            } else {
                ret.status = 2;
            }
        }
        return ret;
    }

    res.json(getDomainInfo(domain));
};

