# Textract Server

This is a Textract Server. It uses the node package textract to convert images, documents, PDFs to simple text using text recognition software from tesseract, pdftotext, ... .

## Docker Image

To run the docker image on your system, use the following command:

```
docker run -p 5000:5000 n3rdc4ptn/textract-server
```

You can use the environment variable `PDF_MAX_PAGES` to prevent pdfs longer than this to be uploaded:

```
docker run -p 5000:5000 -e PDF_MAX_PAGES=5 n3rdc4ptn/textract-server
```


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
