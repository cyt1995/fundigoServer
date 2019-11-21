var express = require('express');
var router = express.Router();

var multer = require('multer');

const fs = require("fs"); // Or `import fs from "fs";` with ESM

function makeFileName(filename){
    var [_filename, ext] = filename.split('.')
    
    var count = 0
    filepath = "public/uploads/" + _filename
    while (fs.existsSync(filepath)) {
        filepath = "public/uploads/" + _filename + count + "." + ext
        count ++;
    }
    return _filename + count;
}

// var upload = multer({ dest: 'static/uploads/'});
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        console.log(file)
        console.log(req.file);
        console.log('====')
        
        filename = makeFileName( file.originalname)
        console.log(filename)
        filedata = {
            name : filename,
            ext : file.mimetype.split('/')[1]
        };
        cb(null, filedata.name + '.' + filedata.ext)
    }
});

var upload = multer({ storage: storage });

router.post('/', upload.single('file'), function(req, res, next) {
    console.log('\nuploadImage.js logs ...');

    console.log("req.file : ");
    console.log(req.file);
    
    // 이미지를 저장한다.
    var image = req.file;
    var result = {
        filename : image.filename,
        size : image.size,
        path : image.path
    }
    //
    res.json(result);
});

module.exports = router;