var ticketTable = {};
var priceTable = [];
var priceDiscountTable = [];
var selectedTicketTable = {};
var salerTable = [];
var payTable = {};
var creditTable = {};
var nowProgram = 0;
var departmentTable = ['Soprano', 'Alto', 'Tenor', 'Bass', '團外', '老師', '友團', '老人'];

function select(a) {
    var click_id = a.attr('id');
    if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['saleid'] != null && !(click_id in selectedTicketTable)){
        for(var id in selectedTicketTable)
            $('#' + id).attr('class', 'seat seat_type_0');
        selectedTicketTable = {};

        var sale_id = ticketTable[click_id]['saleid'];
        var sale_price = 0;
        var department = payTable[sale_id]['department'];
        $('#submit_buyer').val(payTable[sale_id]['buyer']);
        $('#submit_department').val(departmentTable[department]);
        $('#submit_date').val(payTable[sale_id]['time']);
        $('#submit_saler').val(salerTable[payTable[sale_id]['saler']]);

        for(var id in ticketTable){
            if(ticketTable[id]['saleid'] == sale_id){
                $('#' + id).attr('class', 'seat seat_select');
                selectedTicketTable[id] = 1;
                sale_price += priceTable[ticketTable[id]['type']] * priceDiscountTable[ticketTable[id]['type']] / 100;
            }
        }
        if(payTable[sale_id]['paymode'] == 0){
            $('#submit_paymode').val('付清');
            $('#total_priceowe').html('0元');
        }
        else{
            $('#submit_paymode').val('賒帳');
            var oweprice = sale_price - payTable[sale_id]['discount'];
            if(sale_id in creditTable)
                oweprice -= creditTable[sale_id];
            $('#total_priceowe').html(oweprice + '元');
        }
        $('#total_price').html(sale_price - payTable[sale_id]['discount'] + '元');
        $('#submit_discount').val(payTable[sale_id]['discount']);
    }
    else if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['preserve'] == 5 && !(click_id in selectedTicketTable)){
        for(var id in selectedTicketTable)
            $('#' + id).attr('class', 'seat seat_type_0');
        selectedTicketTable = {};

        var sale_id = ticketTable[click_id]['saleid'];
        var sale_price = 0;
        $('#submit_buyer').val('系統票');
        $('#submit_department').val('');
        $('#submit_date').val('');
        $('#submit_saler').val('');
        $('#submit_paymode').val('付清');
        $('#total_priceowe').html('0元');
        $('#submit_discount').val('');

        for(var id in ticketTable){
            if(ticketTable[id]['preserve'] == 5 && ticketTable[id]['state'] == 2){
                $('#' + id).attr('class', 'seat seat_select');
                selectedTicketTable[id] = 1;
                sale_price += priceTable[ticketTable[id]['type']];
            }
        }
        $('#total_price').html(sale_price + '元');
    }
}


function showData(data){
    nowProgram = data['mapattribute'][0]['currentdataid'];
    var nowCategory;
    for(var i = 0; i < data['category'].length; i++){
        if(data['category'][i]['id'] == nowProgram)
            nowCategory = data['category'][i];
    }
    
    $('#update_date').html('更新時間：' + nowCategory['time'] + '　　　瀏覽次數：' + data['mapattribute'][0]['counter']);
    $('#update_message').html(nowCategory['message']);
    $('#requesting').hide();
    $('a[id^=seat_]').addClass('seat_type_2');

    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
        //$('.graphlabel_' + i).html(priceTable[i] + '元');
    }
    for(var i = 0; i < data['manager'].length; i++)
        salerTable[data['manager'][i]['id']] = data['manager'][i]['name'];

    for(var i = 0; i < data['ticket'].length; i++){
        var seat_id = 'seat_' + data['ticket'][i]['floor'] + '_' + data['ticket'][i]['row'] + '_' + data['ticket'][i]['seat'];
        var arr = {};
        arr['id'] = parseInt(data['ticket'][i]['id']);
        arr['state'] = parseInt(data['ticket'][i]['state']);
        arr['type'] = parseInt(data['ticket'][i]['type']);
        arr['preserve'] = parseInt(data['ticket'][i]['preserve']);
        arr['saleid'] = data['ticket'][i]['saleid'];
        ticketTable[seat_id] = arr;
        if(arr['state'] == 2){
            if(data['ticket'][i]['saleid'] != null || data['ticket'][i]['preserve'] == 5)
                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_0');
            else
                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_1');
        }
    }
    for(var i = 0; i < data['paylist'].length; i++)
        payTable[data['paylist'][i]['id']] = data['paylist'][i];
    for(var i = 0; i < data['creditlist'].length; i++){
        if(data['creditlist'][i]['saleid'] in creditTable)
            creditTable[data['creditlist'][i]['saleid']] += data['creditlist'][i]['price'];
        else
            creditTable[data['creditlist'][i]['saleid']] = data['creditlist'][i]['price'];
    }

    $('#message').show();
    $('#floor_4').show();
    $('#floor_3').show();
    $('#floor_2').show();
    $('#form').show();
}


$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqOrder'};
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

            $('a[id^=seat_]').click(function(){
                select($(this));
                return false;
            });
        });
    });
});

