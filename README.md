# Textract Server

This is a Textract Server. It uses the node package textract to convert images, documents, PDFs to simple text using text recognition software from tesseract, pdftotext, ... .

## Installation

First clone this repo to your server

`git clone git@github.com:n3rdc4ptn/textract_server.git`

Now you must install the dependencies.

`npm install`

And you must install every dependency, used by textract, more you could read at the [textract](https://github.com/dbashford/textract#extraction-requirements) repo.


## Usage

Now you must start the server.

`node server.js`

And you could use it via ajax requests.

```javascript
$.ajax({
    url: 'SERVER_URL/upload',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: function(data) {
        console.log("Erfolgreich hochgeladen");
        console.log(data);
    }
});
```
