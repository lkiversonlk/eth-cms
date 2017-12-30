var path = require('path');
var _ = require('lodash');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('./lib/validator.lib');
var session = require('./lib/session.lib');
var logger = require('./lib/logger.lib');
var router = require('./lib/route-map.lib');
var errors = require('./core/controllers/errors.controller').error;
var DomainCache = require("./core/services/domain-cache");
var app = express();

var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("https://mainnet.infura.io/vAugb8H4cG1bOuFMZj3y"));

var ens = require("./lib/ens.lib");
app.set("ethereum", web3);
app.set("ens", ens(web3));

var twitterConf = require("./config/twitter.json");
var TwitterClient = require("./lib/twitter.lib");

var leveldbConf = require("./config/leveldb.json");
var leveldown = require("leveldown");

var ldb = leveldown(leveldbConf.location);
ldb.open({createIfMissing: true}, function (err) {
    if(err){
        console.log("ldb open failed :" + err.toString());
        process.exit(-1);
    } else {
        app.set("ldb", ldb);
        var domainCache = new DomainCache(ldb);
        domainCache.init();
        app.set("domain-cache", domainCache);
    }
});

var twitter = new TwitterClient(twitterConf, 2, function (texts) {
    console.log(texts);
    app.set("tweets", texts);
});
app.set("twitter", twitter);

/**
 * 设置模板解析
 */
app.set('view engine', '.hbs');

/**
 * 中间件
 */
app.use(compression());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger.access());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session.check(), session.init());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * 转给 Roter 处理路由
 */
app.use(router);

/**
 * 错误处理程序
 */
app.use(errors);

/**
 * 导出 APP
 */
module.exports = app;