var async = require('async');
var logger = require('../../lib/logger.lib');

var status = [
    "尚未被注册",
    "正在竞拍中",
    "已经被注册",
    "禁止注册",
    "正在公示阶段",
    "尚未放出"
];

function Record(entry, web3){
    var status_int = parseInt(entry[0]);
    var address = entry[1];
    var date = new Date(parseInt(entry[2]) * 1000);
    var highestBid = web3.fromWei(entry[4], "ether");
    var secondBid = web3.fromWei(entry[3], "ether");
    var status_ch = status[status_int];
    if (highestBid == 0 && status_int == 2){
        status_ch = "等待领取"
    }
    return {
        sti : status_int,
        deed: address,
        date: date,
        stch : status_ch,
        high : highestBid,
        sec : secondBid
    }
};

module.exports = function (req, res) {
    var ethereum = req.app.get("ethereum");
    var ens = req.app.get("ens");
    var domain = req.query.domain;
    console.log("try to parse " + domain + " length " + domain.length);
    res.json(Record(ens.ethRegistrar.entries(ethereum.sha3(domain)), ethereum));
};

