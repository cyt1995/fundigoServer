var mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment"); 

var connection = mongoose.createConnection('mongodb://localhost/feed', {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true 
});
autoIncrement.initialize(connection);

var Schema = mongoose.Schema;

var FeedSchema = new Schema({
    TITLE: {
        type: String,
        require: true
    },
    IMAGE: {
        type: String,
        require: true
    },
    TEXT: {
        type: String,
        require: true
    },
    NAME: {
        type: String,
        require: true
    },
    USERIMAGE: {
        type: String,
        requrie: true
    }

});

FeedSchema.plugin(autoIncrement.plugin, 'Feed');
module.exports = connection.model("Feed", FeedSchema);
