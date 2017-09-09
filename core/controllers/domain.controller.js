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

                res.send(JSON.parse(info));
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
            data.info.time = Date.now();
            ldb.put(data.domain, JSON.stringify(data.info), function (err) {
                if(err){
                    console.log("fail to save domain info, " + err);
                    return res.sendStatus(500)
                } else {
                    return res.sendStatus(200)
                }
            })
        } else {
            console.log("invalid domain post, err + " + result.errors.join("::"));
            return res.sendStatus(500);
        }
    } else {
        return res.sendStatus(500);
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