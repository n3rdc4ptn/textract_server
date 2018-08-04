var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

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
    var filename = "analysen/" + req.files.analysefile.md5 + "_" + req.files.analysefile.name;
    req.files.analysefile.mv(filename);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    textract.fromFileWithPath(filename, function(err, text) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.send(text);
    });
    // res.send("POST");
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});