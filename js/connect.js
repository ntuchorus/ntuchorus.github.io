function connectServer(type, dataset, server, callback){
    $.ajax({
        type: type,
        data: dataset,
        contentType: 'application/json',
        dataType: 'json',
        url: "http://140.112.28.131:3001/" + server,
        success: function(data){
        	callback(data);
        },
        error: function(xhr, ajaxOptions, thrownError){
            callback({'status': '2'});
        }
    });
}
