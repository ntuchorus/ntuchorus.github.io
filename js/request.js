$(document).ready(function(){
    var dataset = {'id': 'guest'};
    connectServer('POST',
                  JSON.stringify(dataset),
                  'request',
                  function(data){
        if(data[0]["status"] == "0"){
            $('#update_date').html('更新時間：' + data[1]['time'] + '　　　瀏覽次數：' + data[1]['counter']);
            $('#update_message').html(data[1]['message']);
            $('#requesting').hide();
            for(var i = 2; i < data.length; i++){
                var seat_id = '#seat_' + data[i]['floor'] + '_' + data[i]['row'] + '_' + data[i]['seat'];
                var seat_state = parseInt(data[i]['state']);
                var seat_type = parseInt(data[i]['type']);
                var seat_preserve = parseInt(data[i]['preserve']);
                if(seat_preserve > 0)
                    $(seat_id).addClass('seat_type_6');
                else if(seat_state == 2)
                    $(seat_id).addClass('seat_type_5');
                else if(seat_state == 1)
                    $(seat_id).addClass('seat_type_4');
                else{
                    if(seat_type >= 4)
                        $(seat_id).addClass('seat_type_6');
                    else
                        $(seat_id).addClass('seat_type_' + seat_type);
                }
            }
            $('#message').show();
            $('#floor_4').show();
            $('#floor_3').show();
            $('#floor_2').show();
        }
        else if(data[0]["status"] == '1'){
            $('#requesting').html('目前非購票時段');
        }
        else{
            $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
        }
    });
});
