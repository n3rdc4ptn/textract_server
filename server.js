var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

var fs = require('fs');

app.use(fileUpload());


var textract = require('textract');

app.get('/upload', function(req, res) {
    console.log(req.query);
    console.log(req.files);
    res.send(
        req.query.callback + "('"+Test+"');" +
        "console.log('Test');"
    );
})

app.post('/upload', function(req, res) {
    console.log(req.files); // the uploaded file object

    var filename = "tmp_files/" + req.files.analysefile.md5 + "_" + req.files.analysefile.name;
    req.files.analysefile.mv(filename);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    textract.fromFileWithPath(filename, {
        preserveLineBreaks: true   
    }, function(err, text) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }

        res.send(text);
        console.log("1");
        // fs.unlink(filename, (err) => {
        //     if (err) throw err;
        // });
    });
    console.log("2");

    // res.send("POST");
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});