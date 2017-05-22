function connectServer(type, dataset, server, callback){
    $.ajax({
        type: type,
        data: dataset,
        contentType: 'application/json',
        dataType: 'json',
        url: "http://ntuchorus.herokuapp.com/" + server,
        success: function(data){
        	callback(data);
        },
        error: function(xhr, ajaxOptions, thrownError){
            callback({'status': '2'});
        }
    });
}
