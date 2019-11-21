// 모듈 호출
var http = require('http');
var createError = require('http-errors');
var express = require('express');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//Route
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var GethInfoRouter = require('./routes/GethInfo');
var saveFeedRouter = require('./routes/saveFeed');
var getFeedRouter = require('./routes/getFeed');
var authRouter = require('./routes/auth');
var uploadImageRouter = require('./routes/uploadImage');

//server
var app = express();
var server = http.createServer(app);
server.listen(8880, function() {
	console.log('Fundigo Express Server Running ... ')
});
// var server = app.listen(8880, function(){
//   console.log("Fundigo Express server start...")
// });

//web3
var Web3 = require('web3');
var web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); //35.223.204.78

var txID = null;
var eth = web3.eth;
var personal = web3.personal;

//DB
var db = mongoose.connection;
//db.on('error', console.error);
db.once('open', function() {
  console.log("Connected to mongod server...");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/GethInfo', GethInfoRouter);
app.use('/saveFeed', saveFeedRouter);
app.use('/getFeed', getFeedRouter);
app.use('/auth', authRouter);
app.use('/uploadImage', uploadImageRouter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//문자를 16진수로
String.prototype.hexEncode = function(){
	var hex, i;

	var result = "";
	for (i=0; i<this.length; i++) {
		hex = this.charCodeAt(i).toString(16);
		result += ("000"+hex).slice(-4);
	}
	return result
}

//16진수를 문자열로
String.prototype.hexDecode = function(){
	var j;
	var hexes = this.match(/.{1,4}/g) || [];
	var back = "";
	for(j = 0; j<hexes.length; j++) {
		back += String.fromCharCode(parseInt(hexes[j], 16));
	}
	return back;
}

module.exports = app;

app.post('/getGps', function(req, res) {
	console.log('\napp.js getGps log ...')
	var txKey = require('./models/txKey');
	var tk =  new txKey();

	var chunk = req.body;
	
	if(chunk.latitude != "null" && chunk.longitude != "null") {
		var str_chunk = JSON.stringify(chunk);
		console.log(str_chunk);
		var hex_chunk_encode = "0x" + str_chunk.hexEncode();

		var account = eth.accounts[0];
        personal.unlockAccount(account, "test", 0);
        var txID = eth.sendTransaction({ 
          from:account, 
          data:hex_chunk_encode
		});

		tk.accounts = account;
		tk.txID = txID;
		console.log("txID = " + txID);
		tk.save(function(err, tk) {
			if(err) {
				return res.status(500).send({status:"0"})
			}
			console.log(tk);
			console.log('DB save completed');
			return res.status(201).send({status:"1"})
		});
		
		var txInfo = eth.getTransaction(txID);
		var text_info = JSON.stringify(txInfo);
		//console.log("txInfo = " + text_info);

		//console.log("=====================채굴전========================");

		var filterString='latest';
        var filter = web3.eth.filter('latest');
  
        filter.watch((err,res) => {
          if(!err) {
            //console.log(`res:block hash = ${res}`);
            var block = web3.eth.getBlock(res);
            //console.log(`block info : ${JSON.stringify(block)}`);
            if(block.transactions.includes(txID)) {
              filter.stopWatching();
              console.log(`\ntxID : ${txID} completed`);
			  //console.log("=====================채굴후========================");
              var receipt = eth.getTransactionReceipt(txID);
              var text_rec = JSON.stringify(receipt);
              console.log(`tx_after_info = ${text_rec}`);
              }
          } else {
            console.log(`err ${err}`);
          }
        });
	}
});