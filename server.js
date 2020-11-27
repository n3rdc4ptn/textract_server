var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
var textract = require('textract');
var PDFINFO = require('pdfinfo');
var pdf_extract = require('pdf-extract');

var cors = require('cors');
var fs = require('fs');


const textractOptions = {
    preserveLineBreaks: true,
    pdftotextOptions: {
        lastPage: parseInt(process.env.PDF_MAX_PAGES || '5')
    },
    tesseract: {
        lang: process.env.TESSERACT_LANG || 'deu'
    }
};

function extractText(filename, res) {
    textract.fromFileWithPath(filename, textractOptions, function(err, text) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }

        res.send(text);
        fs.unlinkSync(filename);
    });
}

function extractTextFromPDF(filename, res) {
    /* First try: using textract */
    textract.fromFileWithPath(filename, textractOptions, function(err, text) {
        if (err) {
            fs.unlinkSync(filename);
            res.status(500).send(err);
            return;
        }

        if (text.length == 0) { // If text is empty --> use pdf_extract with ocr
            var processor = pdf_extract(filename, {
                type: 'ocr',
                ocr_flags: [
                    '--psm 1',       // automatically detect page orientation
                    '-l ' + (process.env.TESSERACT_LANG || 'deu'),       // use a custom language file                  
                ]
            }, function(err) {
                if (err) {
                    res.status(400).send(err);
                }
            });
        
            processor.on('complete', function(data) {
                fs.unlinkSync(filename);
                res.send(data.text_pages.join( '\r\n ' ).trim());
            });
        
            processor.on('error', function(err) {
                fs.unlinkSync(filename);
                console.log(err);
                res.status(500).send('error while extracting pages');
            });
        } else {
            res.send(text);
            fs.unlinkSync(filename);
        }
    });
}

app.use(cors());
app.use(fileUpload());

app.post('/upload', function(req, res) {
    var filename = "tmp_files/" + req.files.analysefile.md5 + "_" + req.files.analysefile.name;
    req.files.analysefile.mv(filename);

    if (req.files.analysefile.mimetype=="application/pdf") {
        if (process.env.PDF_MAX_PAGES) {
            var pdf = PDFINFO(filename);
            pdf.info((err, meta) => {
                if (err) throw err;
                if (meta.pages > parseInt(process.env.PDF_MAX_PAGES)) {
                    res.send("too-many-pages");

                    fs.unlinkSync(filename);
                    return;
                }

                extractTextFromPDF(filename, res);
            });
        } else {
            extractTextFromPDF(filename, res);
        }
    } else {
        extractText(filename, res);
    }
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});