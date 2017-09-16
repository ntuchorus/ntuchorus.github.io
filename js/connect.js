function connectServer(type, dataset, server, callback){
    $.ajax({
        type: type,
        data: dataset,
        contentType: 'application/json',
        dataType: 'json',
        crossDomain: true,
        //url: "http://ntuchorus.herokuapp.com/" + server,
        url: "http://139.162.109.232:3001/" + server,
        success: function(data){
        	callback(data);
        },
        error: function(xhr, ajaxOptions, thrownError){
            callback({'status': '2'});
        }
    });
}
