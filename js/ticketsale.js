var nowProgram = -1;
var ticketTable = {};
var priceTable = [];
var priceDiscountTable = [];
var salerTable = [];
var editTicketTable = {};
var typeSelected = [];
var priceSelected = 0;

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('div[id^=floor_]').remove();
    $('#form').hide();
    $('#submit_buyer').val('');
    $('#submit_department select').val('0');
    $('#submit_saler select').html('');
    $("[name=paymode]").val(["0"]);
    $('#submit_discount').val('0');
    $('#total_price').html('0元');
    nowProgram = e.value;
    ticketTable = {};
    priceTable = [];
    priceDiscountTable = [];
    salerTable = [];
    editTicketTable = {};
    typeSelected = [];
    priceSelected = 0;
    $('#select_viewprogram').html("");
    getData(nowProgram);
}

function inputValidNumber(e, pnumber){
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    if($(e).val() == '')
        $(e).val('0');
    $('#total_price').html(priceSelected - parseInt($(e).val()) + '元');
    return false;
}

function updateSeat(id) {
    var classStr = 'seat';
    if(ticketTable[id]['saleid'] || ticketTable[id]['preserve'] >= 4)
        classStr += ' seat_type_a';
    else if(id in editTicketTable)
        classStr += ' seat_select';
    else
        classStr += ' seat_type_' + ticketTable[id]['type'];
    return classStr;
}

function showTypeSelected() {
    var str = "<div class='form_label'>已選取張數：</div>";
    for(var i = 0; i < priceTable.length - 1; i++)
        str += "<div id='submit_count_type" + i + "'>0</div>";
    $('#submit_count').html(str);
}

function select(a) {
    var click_id = a.attr('id');
    var click_type = ticketTable[click_id]['type'];
    var click_price = priceTable[click_type] * priceDiscountTable[click_type] / 100;
    if(ticketTable[click_id]['state'] == 2 && !ticketTable[click_id]['saleid'] && ticketTable[click_id]['preserve'] < 4){
        if(click_id in editTicketTable){
            delete editTicketTable[click_id];
            priceSelected -= click_price;
            typeSelected[click_type] -= 1;
            $('#submit_count_type' + click_type).html(typeSelected[click_type]);
        }
        else{
            editTicketTable[click_id] = 1;
            priceSelected += click_price;
            typeSelected[click_type] += 1;
            $('#submit_count_type' + click_type).html(typeSelected[click_type]);
        }
        $('#' + click_id).attr('class', updateSeat(click_id));
    }
    $('#total_price').html(priceSelected - parseInt($('#submit_discount').val()) + '元');
}

function commitData(){
    if($('#submit_buyer').val() == "")
        alert('姓名欄不得為空白');
    else if(Object.keys(editTicketTable).length == 0)
        alert('請選取座位');
    else if($('#submit_date').val() == "")
        alert('日期不得為空白');
    else{
        var dataset = {}, idset = [];
        for(var id in editTicketTable)
            idset.push(ticketTable[id]['id']);
        dataset['id'] = idset;
        dataset['buyer'] = $('#submit_buyer').val();
        dataset['department'] = parseInt($('#submit_department select').val());
        dataset['time'] = $('#submit_date').val();
        dataset['saler'] = parseInt($('#submit_saler select').val());
        dataset['paymode'] = parseInt($('input[name="paymode"]:checked').val());
        dataset['discount'] = parseInt($('#submit_discount').val());

        fbsdkCheckLogin(function(fbID, fbToken){
            var commit = {'id': fbID, 'token': fbToken, 'cmd': 'creSaleTicket', 'data': dataset, 'programid': nowProgram};
            connectServer('POST',
                          JSON.stringify(commit),
                          'create',
                          function(data){
                if(data["status"] == "0")
                    window.location.reload();
                else if(data["status"] == "2")
                    alert('權限不足，僅該場公演的票務團秘可以登記售票資訊');
                else
                    alert('寫入失敗，請稍候再試或聯絡管理員');
            });
        });
    }
    return false;
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

    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
        typeSelected[i] = 0;
    }
    for(var i = 0; i < data['progmanager'].length; i++){
        salerTable[data['progmanager'][i]['id']] = data['progmanager'][i]['name'];
        $('#submit_saler select').append('<option value="' + data['progmanager'][i]['id'] + '">' + data['progmanager'][i]['name'] + '</option>\n');
    }
    showTypeSelected();

    var mapCode = getMapCode(data['ticket'], 'a', false, nowCategory['mapwidth'], function(item){
        var seat_id = 'seat_' + item['floor'] + '_' + item['row'] + '_' + item['seat'];
        var arr = {};
        arr['id'] = parseInt(item['id']);
        arr['state'] = parseInt(item['state']);
        arr['type'] = parseInt(item['type']);
        arr['preserve'] = parseInt(item['preserve']);
        arr['saleid'] = parseInt(item['saleid']);
        ticketTable[seat_id] = arr;
        if(arr['state'] == 2)
            return updateSeat(seat_id);
        else
            return 'seat seat_type_b';
    });
    for(var i = 0; i < mapCode.length; i++)
        $(mapCode[i]).insertAfter("#message");

    $('a[id^=seat_]').click(function(){
        select($(this));
        return false;
    });

    var date = new Date();
    var dateM = date.getMonth() + 1 > 9 ? '' + (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    var dateD = date.getDate() > 9 ? '' + date.getDate() : '0' + date.getDate();
    $('#submit_date').val(date.getFullYear() + '-' + dateM + '-' + dateD);
    $('#message').show();
    $('div[id^=floor_]').show();
    $('#form').show();
}

function getData(pid){
    fbsdkCheckLogin(function(fbID, fbToken){
        var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqTicket'};
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
        $('#submit').click(function(){
            commitData();
            return false;
        });
    });
});

