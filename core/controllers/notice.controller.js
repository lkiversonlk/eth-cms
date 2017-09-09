var siteInfoService = require('../services/site-info.service');
var categoriesService = require('../services/categories.service');
var async = require("async");

module.exports = function (req, res, next) {
    async.parallel({
        siteInfo: siteInfoService.get,
        navigation: function (callback) {
            categoriesService.navigation({ current: "/notice" }, callback);
        }
    }, function (err, results) {
        res.render("page-notice", {
            layout: "layout-default",
            siteInfo: results.siteInfo,
            navigation: results.navigation,
            category: {name: "操作进行中"}
        });
    });
};