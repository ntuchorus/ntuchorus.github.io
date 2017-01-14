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

                    for(var i = 4; i < data.length; i++){
                        var seat_id = 'seat_' + data[i]['floor'] + '_' + data[i]['row'] + '_' + data[i]['seat'];
                        var seat_state = parseInt(data[i]['state']);
                        var seat_type = parseInt(data[i]['type']);
                        var seat_preserve = parseInt(data[i]['preserve']);
                        var arr = {};
                        arr['id'] = parseInt(data[i]['id']);
                        arr['state'] = parseInt(data[i]['state']);
                        arr['type'] = parseInt(data[i]['type']);
                        arr['preserve'] = parseInt(data[i]['preserve']);
                        arr['price'] = parseInt(data[i]['price']);
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
                else if(data[0]["status"] == '1'){
                    $('#requesting').html('目前非購票時段');
                }
                else if(data[0]["status"] == '2'){
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

