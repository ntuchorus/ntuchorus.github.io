var ticketTable = {};
var editTicketTable = {};
var priceSelected = 0;

function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    
    $('#' + id).attr('class', 'seat');
    if(finalPreserve > 0)
        $('#' + id).addClass('seat_type_6');
    else{
        if(id in editTicketTable)
            $('#' + id).addClass('seat_select');
        else{
            if(finalState == 2)
                $('#' + id).addClass('seat_type_5');
            else if(finalState == 1)
                $('#' + id).addClass('seat_type_4');
            else
                $('#' + id).addClass('seat_type_' + finalType);
        }
    }
}

function select(a) {
    var click_id = a.attr('id');
    var click_price = ticketTable[click_id]['price'];
    if(ticketTable[click_id]['type'] < 3)
        click_price *= 0.9;
    if(ticketTable[click_id]['type'] < 4 && ticketTable[click_id]['preserve'] == 0){
        if(click_id in editTicketTable){
            delete editTicketTable[click_id];
            priceSelected -= click_price;
        }
        else{
            editTicketTable[click_id] = 1;
            priceSelected += click_price;
        }
        updateSeat(click_id);
    }
    $('#form_label').html('選取總金額：' + priceSelected + '元');
}

function commitData(mode){
    var dataset = [];
    for(var id in editTicketTable){
        dataset.push(ticketTable[id]['id']);
    }
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'drawTicket', 'data': dataset, 'mode': mode};
        connectServer('POST',
                      JSON.stringify(commit),
                      'edit',
                      function(data){
            if(data["status"] == "0"){
                window.location.reload();
            }
            else{
                alert('寫入失敗，請稍候再試或聯絡管理員');
            }
        });
    });
    return false;
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'id': fbID, 'token': fbToken};
            connectServer('POST',
                          JSON.stringify(dataset),
                          'request',
                          function(data){
                if(data["status"] == "0"){
                    $('#update_date').html('更新時間：' + data['message']['time'] + '　　　瀏覽次數：' + data['message']['counter']);
                    $('#update_message').html(data['message']['message']);
                    $('#requesting').hide();

                    var statistic_sale = [0, 0, 0, 0, 0], statistic_total = [0, 0, 0, 0, 0], statistic_price = [400, 600, 800, 1200];
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

                    for(var i = 0; i < data['ticket'].length; i++){
                        var seat_id = 'seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
                        var seat_state = parseInt(data['ticket'][i]['state']);
                        var seat_type = parseInt(data['ticket'][i]['type']);
                        var seat_preserve = parseInt(data['ticket'][i]['preserve']);
                        var arr = {};
                        arr['id'] = parseInt(data['ticket'][i]['id']);
                        arr['state'] = parseInt(data['ticket'][i]['state']);
                        arr['type'] = parseInt(data['ticket'][i]['type']);
                        arr['preserve'] = parseInt(data['ticket'][i]['preserve']);
                        arr['price'] = parseInt(data['ticket'][i]['price']);
                        ticketTable[seat_id] = arr;
                        if(seat_preserve > 0)
                            $('#' + seat_id).addClass('seat_type_6');
                        else if(seat_state == 2)
                            $('#' + seat_id).addClass('seat_type_5');
                        else if(seat_state == 1)
                            $('#' + seat_id).addClass('seat_type_4');
                        else{
                            if(seat_type >= 4)
                                $('#' + seat_id).addClass('seat_type_6');
                            else
                                $('#' + seat_id).addClass('seat_type_' + seat_type);
                        }
                    }
                    $('#message').show();
                    $('#floor_4').show();
                    $('#floor_3').show();
                    $('#floor_2').show();
                    $('#statistic').show();
                    $('#form').show();
                }
                else if(data["status"] == '1'){
                    $('#requesting').html('目前非購票時段');
                }
                else if(data["status"] == '2'){
                    $('#requesting').html('權限不足');
                }
                else{
                    $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
                }
            });

            $('a[id^=seat_]').click(function(){
                select($(this));
                return false;
            });
            $('#submit_clear').click(function(){
                commitData(0);
                return false;
            });
            $('#submit_occupy').click(function(){
                commitData(1);
                return false;
            });
            $('#submit_sale').click(function(){
                commitData(2);
                return false;
            });

        });
    });
});

