$(document).ready(function(){
    var dataset = {'id': 'guest'};
    connectServer('POST',
                  JSON.stringify(dataset),
                  'request',
                  function(data){
        if(data["status"] == "0"){
            $('#update_date').html('更新時間：' + data['message']['time'] + '　　　瀏覽次數：' + data['message']['counter']);
            $('#update_message').html(data['message']['message']);
            $('#requesting').hide();

            var statistic_sale = [0, 0, 0, 0, 0], statistic_total = [0, 0, 0, 0, 0], statistic_price = [400, 700, 1000, 1500];
            for(var i = 0; i < data['statistics'].length; i++){
                statistic_total[data['statistics'][i]['type']] += parseInt(data['statistics'][i]['num']);
                statistic_total[4] += parseInt(data['statistics'][i]['num']);
                if(parseInt(data['statistics'][i]['state']) == 2){
                    statistic_sale[data['statistics'][i]['type']] += parseInt(data['statistics'][i]['num']);
                    statistic_sale[4] += parseInt(data['statistics'][i]['num']);
                }
            }
            for(var i = 0; i < 4; i++){
                var rate = ((statistic_sale[i] / statistic_total[i]) * 100).toFixed(1);
                $('#statistic_label_' + i).html(statistic_price[i] + '元：' + rate + '%');
                $('#statistic_bar_progress_' + i).css('width', (rate * 1.7).toFixed());
            }

            $('#statistic_label_total').html("總計：" + (statistic_sale[4] / statistic_total[4] * 100).toFixed(1) + '%');
            $('#statistic_bar_progress_total').css('width', (statistic_sale[4] / statistic_total[4] * 170).toFixed());
            $('#statistic_label_DM').html("DM發送量： [" + data['DM']['sale'] + ' / ' + data['DM']['total'] + '] ' + (data['DM']['sale'] / data['DM']['total'] * 100).toFixed(1) + '%');
            $('#statistic_bar_progress_DM').css('width', (data['DM']['sale'] / data['DM']['total'] * 950).toFixed());

            for(var i = 0; i < data['ticket'].length; i++){
                var seat_id = '#seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
                var seat_state = parseInt(data['ticket'][i]['state']);
                var seat_type = parseInt(data['ticket'][i]['type']);
                var seat_preserve = parseInt(data['ticket'][i]['preserve']);
                if(seat_preserve == 1 || seat_preserve == 4 || seat_preserve == 5)
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
        else if(data["status"] == '1'){
            $('#requesting').html('目前非購票時段');
        }
        else{
            $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
        }
    });
});
