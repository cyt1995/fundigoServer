var mongoose = require('mongoose');
var autoIncrement = require("mongoose-auto-increment"); 

var connection = mongoose.createConnection('mongodb://localhost/txKey', {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true 
});
autoIncrement.initialize(connection);

var Schema = mongoose.Schema;

var txSchema = new Schema({
    account: { //0xc4ff0b4a3b720c0455077e78ca296bdf8f9f04a1
        type: String,
        require: true
    },
    txID: {
        type: String,
        require: true
    }
});

txSchema.plugin(autoIncrement.plugin, 'txKey');
module.exports = connection.model("txKey", txSchema);
