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
        ldb.get(domain, {asBuffer: false}, function (err, info) {
            if(err) {
                return res.json([]);
            } else {
                res.send(info);
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