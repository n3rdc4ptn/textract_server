$.ajax({
    url: 'http://minest.ml:5000/upload',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: function(data) {
        console.log("Erfolgreich hochgeladen");
        console.log(data);
    }
});