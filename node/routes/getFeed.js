var express = require('express');
var router = express.Router();

var Feed = require('../models/Feed');
var count = null

// GET ALL feed
router.get('/', (req, res) => {
    console.log('\ngetFeed.js logs ...')
    Feed.count((err, c) => {
        if(err) return res.status(500).send({error : 'database failure'});
        count = c;
        console.log(`count : ${count}`);
        
        if(count == 0 ) {
            res.send('0'); //내용이 없음
        }
        else {
            Feed.find((err, feed) => {
                if(err) return res.status(500).send({error : 'database failure'});
                res.json(feed);
            });
            //역순
            // Feed.find((err, feed) => {
            //     if(err) return res.status(500).send({error : 'database failure'});
            //     res.json(feed);
            // }).sort({"_id":-1});
        }
    });
    
});

module.exports = router;