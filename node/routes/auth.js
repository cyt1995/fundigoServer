var express = require('express');
var router = express.Router();

var Web3 = require('web3');
var web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); //35.223.204.78

var txKey = require('../models/txKey');

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

router.post('/', (req, res) => {
    var data = req.body; //gpsInfo
    console.log("\nauth.js logs ...");
    console.log("request data :");
    console.log(data);
    var auth = 0;
    var txIDarray = null;
    var count = null;

    txKey.count((err, c) => {
        if(err) return res.status(500).send({error : 'database failure'});
        count = c;
        //console.log('count : ' + count);

        if(count == 0 ) {
            res.send("내용이 없음");
        }
        else if(count == 1) {
            res.send("내용이 하나 밖에 없음");
        }
        else {
            var fix_data_lat = decimalCut(data.latitude);
            var fix_data_lon = decimalCut(data.longitude);
            console.log(`data_lat : ${fix_data_lat}\ndata_lon : ${fix_data_lon}`)
            txKey.find((err, txID) => {
                if(err) return res.status(500).send({error : 'database failure'});
                txIDarray = txID;
                //console.log(txIDarray);

                if( web3.isConnected() == true ){
                    for(i=0; i<count; i++){
                        var txInfo = web3.eth.getTransaction(txIDarray[i].txID);
                        // console.log("txInfo :");
                        // console.log(txInfo);
                        if(txInfo != null) {
                            var hex_code = txInfo.input;
                            //console.log('hex_code : ' + hex_code);
                            var fix_hex_code = hex_code.split('x');
                            var str_hex_code = fix_hex_code[1].hexDecode();
                            //console.log('str_hex_code : ' + str_hex_code);
                            var json_code = JSON.parse(str_hex_code);
                            //console.log('json_code : ');
                            //console.log(json_code);

                            var latitude = json_code.latitude;
                            var fix_latitude = decimalCut(latitude);
                            var longitude = json_code.longitude;
                            var fix_longitude = decimalCut(longitude);

                            console.log(`fix_lat : ${fix_latitude}\n fix_lon : ${fix_longitude}`);

                            if(fix_latitude == fix_data_lat && fix_longitude == fix_data_lon && auth == 0) {
                                auth = 1;
                                console.log("res : auth success");
                                res.send('auth success');
                                return 0;
                            }
                            else if (i==count-1 && auth == 0) {
                                //console.log(count);
                                console.log("res : auth fail");
                                res.send('auth fail');
                            }
                        }
                        else
                            console.log(`\ntxID_array[ ${i} ] : iniput is null\n`);
                    }
                }
                else {
                    console.log('web3 is not connected.');
                    res.send("web3 is not connected.");
                }
                
            }).sort({"_id":-1});
        }
    });
});

module.exports = router;

function decimalCut(str) {
    var flo = parseFloat(str);
    var fix_flo = Math.floor(flo*100)/100;

    return fix_flo;
}