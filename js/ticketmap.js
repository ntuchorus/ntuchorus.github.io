var nowProgram = -1;
var ticketTable = {};
var priceTable = [];
var priceDiscountTable = [];
var selectedTicketTable = {};
var salerTable = [];
var payTable = {};
var creditTable = {};
var typeSelected = [];
var departmentTable = ['Soprano', 'Alto', 'Tenor', 'Bass', '團外', '老師', '友團', '老人'];

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('#floor_4').hide();
    $('#floor_3').hide();
    $('#floor_2').hide();
    $('#form').hide();
    $('#submit_buyer').val('');
    $('#submit_department').val('');
    $('#submit_date').val('');
    $('#submit_saler').val('');
    $('#submit_paymode').val('');
    $('#submit_discount').val('');
    $('#total_price').html('0元');
    $('#total_priceowe').html('0元');
    nowProgram = e.value;
    ticketTable = {};
    priceTable = [];
    priceDiscountTable = [];
    selectedTicketTable = {};
    salerTable = [];
    payTable = {};
    creditTable = {};
    typeSelected = [];
    $('#select_viewprogram').html("");
    getData(nowProgram);
}

function updateSeat(id) {
    $('#' + id).attr('class', 'seat');
    if(ticketTable[id]['state'] < 2 || ticketTable[id]['preserve'] == 4 || ticketTable[id]['preserve'] > 5)
        $('#' + id).addClass('seat_type_b');
    else if(ticketTable[id]['state'] == 2 && ticketTable[id]['saleid'] == null && ticketTable[id]['preserve'] != 5)
        $('#' + id).addClass('seat_type_a');
    else if(id in selectedTicketTable)
        $('#' + id).addClass('seat_select');
    else
        $('#' + id).addClass('seat_type_' + ticketTable[id]['type']);
}

function showTypeSelected() {
    var str = "<div class='form_label'>已選取張數：</div>";
    for(var i = 0; i < priceTable.length - 1; i++)
        str += "<div id='submit_count_type" + i + "'>" + typeSelected[i] + "</div>";
    $('#submit_count').html(str);
}

function select(a) {
    var click_id = a.attr('id');
    if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['saleid'] != null && !(click_id in selectedTicketTable)){
        var deleteSelectTable = {};
        for(var id in selectedTicketTable){
            deleteSelectTable[id] = 1;
            typeSelected[ticketTable[id]['type']] -= 1;
        }
        selectedTicketTable = {};
        for(var id in deleteSelectTable)
            updateSeat(id);

        var sale_id = ticketTable[click_id]['saleid'];
        var sale_price = 0;
        var department = payTable[sale_id]['department'];
        $('#submit_buyer').val(payTable[sale_id]['buyer']);
        $('#submit_department').val(departmentTable[department]);
        $('#submit_date').val(payTable[sale_id]['time']);
        $('#submit_saler').val(salerTable[payTable[sale_id]['saler']]);

        for(var id in ticketTable){
            if(ticketTable[id]['saleid'] == sale_id){
                selectedTicketTable[id] = 1;
                updateSeat(id);
                typeSelected[ticketTable[id]['type']] += 1;
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
        var deleteSelectTable = {};
        for(var id in selectedTicketTable){
            deleteSelectTable[id] = 1;
            typeSelected[ticketTable[id]['type']] -= 1;
        }
        selectedTicketTable = {};
        for(var id in deleteSelectTable)
            updateSeat(id);

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
                updateSeat(id);
                typeSelected[ticketTable[id]['type']] += 1;
                sale_price += priceTable[ticketTable[id]['type']];
            }
        }
        $('#total_price').html(sale_price + '元');
    }
    showTypeSelected();
}

function showData(data){
    if(nowProgram == -1)
        nowProgram = data['mapattribute'][0]['currentdataid'];
    $('#menumanager').html("Hi, " + data['user']['name']);
    var nowCategory;
    for(var i = 0; i < data['category'].length; i++){
        var addStr = "<option value='" + data['category'][i]['id'] + "'>" + data['category'][i]['year'];
        if(data['category'][i]['season'] == 0)
            addStr += '冬季';
        else
            addStr += '夏季';
        addStr += "《" + data['category'][i]['title'] + "》</option>";
        $('#select_viewprogram').append(addStr);
        if(data['category'][i]['id'] == nowProgram){
            nowCategory = data['category'][i];
            $('#select_viewprogram').val(nowProgram);
        }
    }
    
    $('#update_date').html('更新時間：' + nowCategory['time'] + '　　　瀏覽次數：' + data['mapattribute'][0]['counter']);
    $('#update_message').html(nowCategory['message']);
    $('#requesting').hide();
    $('a[id^=seat_]').attr('class', 'seat seat_type_b');

    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
        typeSelected[i] = 0;
    }
    for(var i = 0; i < data['manager'].length; i++)
        salerTable[data['manager'][i]['id']] = data['manager'][i]['name'];
    showTypeSelected();

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
            updateSeat(seat_id);
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

function getData(pid){
    fbsdkCheckLogin(function(fbID, fbToken){
        var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqOrder'};
        if(pid != -1)
            dataset['programid'] = pid;
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
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        getData(nowProgram);
        $('a[id^=seat_]').click(function(){
            select($(this));
            return false;
        });
    });
});

