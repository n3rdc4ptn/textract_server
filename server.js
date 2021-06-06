var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
var textract = require('textract');
var PDFINFO = require('pdfinfo');
var pdf_extract = require('pdf-extract');

var cors = require('cors');
var fs = require('fs');

// Clean tmp_files on startup
if (fs.existsSync('tmp_files')) {
    fs.rmdirSync('tmp_files', {
        recursive: true
    });
}
fs.mkdirSync('tmp_files');


const textractOptions = {
    preserveLineBreaks: true,
    pdftotextOptions: {
        lastPage: parseInt(process.env.PDF_MAX_PAGES || '5')
    },
    tesseract: {
        lang: process.env.TESSERACT_LANG || 'deu'
    }
};

function removeFile(filename) {
    fs.unlinkSync(filename)
}

function extractText(filename, res) {
    textract.fromFileWithPath(filename, textractOptions, function(err, text) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            removeFile(filename)
            return;
        }

        res.send(text);
        removeFile(filename)
    });
}

function extractTextFromPDF(filename, res) {
    /* First try: using textract */
    textract.fromFileWithPath(filename, textractOptions, function(err, text) {
        if (err) {
            removeFile(filename)
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
                res.send(data.text_pages.join( '\r\n ' ).trim());
                removeFile(filename)
            });
        
            processor.on('error', function(err) {
                console.log(err);
                res.status(500).send('error while extracting pages');
                removeFile(filename)
            });
        } else {
            res.send(text);
            removeFile(filename)
        }
    });
}

app.use(cors());
app.use(fileUpload());

app.post('/upload', async function(req, res) {
    var filename = "tmp_files/" + req.files.analysefile.md5 + "_" + Date.now() + "_" + req.files.analysefile.name;
    await req.files.analysefile.mv(filename);

    if (req.files.analysefile.mimetype=="application/pdf") {
        if (process.env.PDF_MAX_PAGES) {
            var pdf = PDFINFO(filename);
            pdf.info((err, meta) => {
                if (err) throw err;
                if (meta.pages > parseInt(process.env.PDF_MAX_PAGES)) {
                    res.send("too-many-pages");

                    removeFile(filename)
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