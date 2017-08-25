module.exports = function (req, res, next) {
    var twitter = req.app.get("twitter");
    var since_id = req.query.since_id;
    if(twitter){
        twitter.fetch(since_id, function (error, tweets) {
            if(error){
                return res.json({error: true});
            } else {
                return res.json(tweets);
            }
        })
    } else {
        return res.json({error: true});
    }
};