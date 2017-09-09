var express = require("express");
var router = express.Router();

var apicache = require("apicache");
var cache = apicache.middleware;
var validator = require("jsonschema").Validator;
var v = new validator();
var domain_info_schema = require("../../config/domain.info.json");

exports.search = function (req, res) {
    var domain = req.query.domain;

    var ldb = req.app.get("ldb");

    if(domain) {
        //query by domain
        ldb.get(domain, {asBuffer: true}, function (err, info) {
            if(err) {
                return res.json([]);
            } else {
                try{
                    var data = JSON.parse(info);
                    return res.send(data);
                } catch (e) {
                    console.log("fail to send json :" + info.toString() + "  reason: " + e.toString());
                    return res.json({});
                }
            }
        });
    } else {
        //query all
        res.json([]);
    }
};

exports.insert = function (req, res) {
    var data = req.body;
    var ldb = req.app.get("ldb");
    if(data) {
        var result = v.validate(data, domain_info_schema);
        if(result.valid){
            data.time = Date.now();

            //verify data.owner
            var owner = data.owner;
            if(!owner || owner.length < 1){
                return res.redirect("/notice?error=无法获取域名owner");
            } else {
                var ens = req.app.get("ens");
                var ens_owner = ens.ens.owner(ens.namehash(data.domain + ".eth"));

                if(owner == ens_owner){
                    ldb.put(data.domain, JSON.stringify(data), function (err) {
                        if(err){
                            console.log("fail to save domain info, " + err);
                            return res.redirect("/notice?error=内部错误");
                        } else {
                            return res.redirect("/notice?");
                        }
                    })
                } else {
                    return res.redirect("/notice?error=你不是域名owner");
                }
            }
        } else {
            console.log("invalid domain post, err + " + result.errors.join("::"));
            return res.redirect("/notice?error=提交数据格式错误");
        }
    } else {
        return res.redirect("/notice?error=提交数据格式错误");
    }
};

exports.all = function (req, res, next) {
    var domainCache = req.app.get("domain-cache");
    if(domainCache) {
        res.json(domainCache.all());
    } else {
        console.log("fail to get domain cache");
        res.json([]);
    }
};