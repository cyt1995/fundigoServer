var express = require('express');
var router = express.Router();

var Feed = require('../models/Feed');

router.post('/', (req, res, next) => {
    var data = req.body;
    
    console.log('\nsaveFeed.js logs ...');
    console.log('data :');
    console.log(data);

    var feed = new Feed();

    var title = data.TITLE;
    var image = data.IMAGE;
    var text = data.TEXT;
    // var name = data.NAME;
    // var userImage = data.USERIMAGE;

    feed.TITLE = title;
    feed.IMAGE = image;
    feed.TEXT = text;
    // feed.NAME = name;
    // feed.USERIMAGE = userImage;

    feed.save(function(err, feed) {
        if(err) {
            return res.status(500).send({status:"0"})
        }
        return res.status(201).send({status:"1"})
    });
});

module.exports = router;