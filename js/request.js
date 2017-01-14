$(document).ready(function(){
    var dataset = {'id': 'guest'};
    $('#requesting').html('電子票圖資料庫維護，預計下午18:00開啟服務');
    /*
    connectServer('POST',
                  JSON.stringify(dataset),
                  'request',
                  function(data){
        if(data[0]["status"] == "0"){
            $('#update_date').html('更新時間：' + data[1]['time'] + '　　　瀏覽次數：' + data[1]['counter']);
            $('#update_message').html(data[1]['message']);
            $('#requesting').hide();

            var statistic_cnt_total = 0, statistic_cnt_sale = 0;
            for(var i = 0; i < 4; i++){
                var rate = (parseInt(data[2][i]['sale']) / parseInt(data[2][i]['total']) * 100).toFixed(1);
                statistic_cnt_total += parseInt(data[2][i]['total']);
                statistic_cnt_sale += parseInt(data[2][i]['sale']);
                $('#statistic_label_' + data[2][i]['type']).html(data[2][i]['price'] + '元：' + rate + '%');
                $('#statistic_bar_progress_' + data[2][i]['type']).css('width', (rate * 1.7).toFixed());
            }
            $('#statistic_label_total').html("總計：" + (statistic_cnt_sale / statistic_cnt_total * 100).toFixed(1) + '%');
            $('#statistic_bar_progress_total').css('width', (statistic_cnt_sale / statistic_cnt_total * 170).toFixed());
            $('#statistic_label_DM').html("DM發送量： [" + data[2][5]['sale'] + ' / ' + data[2][5]['total'] + '] ' + (data[2][5]['sale'] / data[2][5]['total'] * 100).toFixed(1) + '%');
            $('#statistic_bar_progress_DM').css('width', (data[2][5]['sale'] / data[2][5]['total'] * 950).toFixed());

            for(var i = 3; i < data.length; i++){
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
            $('#statistic').show();
        }
        else if(data[0]["status"] == '1'){
            $('#requesting').html('目前非購票時段');
        }
        else{
            $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
        }
    });
    */
});
