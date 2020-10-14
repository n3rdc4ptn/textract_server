var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
var textract = require('textract');
var PDFINFO = require('pdfinfo');

var fs = require('fs');

function extractText(filename, res) {
    textract.fromFileWithPath(filename, {
        preserveLineBreaks: true,
        pdftotextOptions: {
            lastPage: parseInt(process.env.PDF_MAX_PAGES)
        }
    }, function(err, text) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }

        fs.unlinkSync(filename);
        res.send(text);
    });
}

app.use(fileUpload());

app.post('/upload', function(req, res) {
    // console.log(req.files); // the uploaded file object

    var filename = "tmp_files/" + req.files.analysefile.md5 + "_" + req.files.analysefile.name;
    req.files.analysefile.mv(filename);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if (process.env.PDF_MAX_PAGES && req.files.analysefile.mimetype=="application/pdf") {
        var pdf = PDFINFO(filename);
        pdf.info((err, meta) => {
            if (err) throw err;
            if (meta.pages > parseInt(process.env.PDF_MAX_PAGES)) {
                res.send("too-many-pages");

                fs.unlinkSync(filename);
                return;
            }

            extractText(filename, res);
        })
    } else {
        extractText(filename, res);
    }


    // res.send("POST");
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});