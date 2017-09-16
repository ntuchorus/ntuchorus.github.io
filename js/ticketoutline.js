var nowProgram = 0;
var priceTable = [];


function showData(data){
    nowProgram = data['mapattribute'][0]['currentdataid'];
    var statistic_sale = [0, 0, 0, 0, 0], statistic_total = [0, 0, 0, 0, 0], nowCategory;
    for(var i = 0; i < data['category'].length; i++){
        if(data['category'][i]['id'] == nowProgram)
            nowCategory = data['category'][i];
    }
    
    $('#update_date').html('更新時間：' + nowCategory['time'] + '　　　瀏覽次數：' + data['mapattribute'][0]['counter']);
    $('#update_message').html(nowCategory['message']);
    $('#requesting').hide();
    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        $('.graphlabel_' + i).html(priceTable[i] + '元');
        $('#statistic_label_' + i).html(priceTable[i] + '元：');
    }
    for(var i = 0; i < data['percentage'].length; i++){
        statistic_total[data['percentage'][i]['type']] += parseInt(data['percentage'][i]['num']);
        statistic_total[4] += parseInt(data['percentage'][i]['num']);
        if(parseInt(data['percentage'][i]['state']) == 2){
            statistic_sale[data['percentage'][i]['type']] += parseInt(data['percentage'][i]['num']);
            statistic_sale[4] += parseInt(data['percentage'][i]['num']);
        }
    }
    for(var i = 0; i < 4; i++){
        var rate = ((statistic_sale[i] / statistic_total[i]) * 100).toFixed(1);
        $('#statistic_label_' + i).html(priceTable[i] + '元：' + rate + '%');
        $('#statistic_bar_progress_' + i).css('width', (rate * 1.7).toFixed());
    }
    $('#statistic_label_total').html("總計：" + (statistic_sale[4] / statistic_total[4] * 100).toFixed(1) + '%');
    $('#statistic_bar_progress_total').css('width', (statistic_sale[4] / statistic_total[4] * 170).toFixed());
    $('#statistic_label_DM').html("DM發送量： [" + nowCategory['dmsale'] + ' / ' + nowCategory['dmtotal'] + '] ' + (nowCategory['dmtotal'] == 0 ? 0 : ((nowCategory['dmsale'] / nowCategory['dmtotal'] * 100).toFixed(1))) + '%');
    $('#statistic_bar_progress_DM').css('width', ((nowCategory['dmtotal'] == 0 ? 0 : (nowCategory['dmsale'] / nowCategory['dmtotal'])) * 950).toFixed());


    for(var i = 0; i < data['ticket'].length; i++){
        var seat_id = '#seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
        var seat_state = parseInt(data['ticket'][i]['state']);
        var seat_type = parseInt(data['ticket'][i]['type']);
        var seat_preserve = parseInt(data['ticket'][i]['preserve']);
        if(seat_preserve > 0 && data['mapattribute'][0]['isshowhidden'] == 0)
            $(seat_id).addClass('seat_type_6');
        else if((seat_preserve == 1 || seat_preserve >= 4) && data['mapattribute'][0]['isshowhidden'] == 1)
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


$(document).ready(function(){
    var dataset = {'id': 'guest', 'cmd': 'reqMap'};
    connectServer('POST',
                  JSON.stringify(dataset),
                  'request',
                  function(data){
        if(data["status"] == "0")
            showData(data);
        else if(data["status"] == '1')
            $('#requesting').html('目前非購票時段');
        else if(data["status"] == '2')
            $('#requesting').html('權限不足');
        else
            $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
      
    });
});