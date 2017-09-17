var nowProgram = -1;
var ticketTable = {};
var priceTable = [];
var priceDiscountTable = [];
var salerTable = [];
var editTicketTable = {};
var priceSelected = 0;

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('#floor_4').hide();
    $('#floor_3').hide();
    $('#floor_2').hide();
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
    $('#' + id).attr('class', 'seat');
    if(id in editTicketTable)
        $('#' + id).addClass('seat_select');
    else{
        $('#' + id).addClass('seat_type_0');
    }
}

function select(a) {
    var click_id = a.attr('id');
    var click_price = priceTable[ticketTable[click_id]['type']] * priceDiscountTable[ticketTable[click_id]['type']] / 100;
    if(ticketTable[click_id]['state'] == 2 && ticketTable[click_id]['saleid'] == null && ticketTable[click_id]['preserve'] < 4){
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
    $('a[id^=seat_]').attr('class', 'seat seat_type_2');

    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
    }
    for(var i = 0; i < data['progmanager'].length; i++){
        salerTable[data['progmanager'][i]['id']] = data['progmanager'][i]['name'];
        $('#submit_saler select').append('<option value="' + data['progmanager'][i]['id'] + '">' + data['progmanager'][i]['name'] + '</option>\n');
    }

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
            if(data['ticket'][i]['saleid'] == null && data['ticket'][i]['preserve'] < 4)
                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_0');
            else
                $('#' + seat_id).removeClass('seat_type_2').addClass('seat_type_1');
        }
    }

    var dateArr = new Date().toLocaleDateString().split('/');
    dateArr[1] = dateArr[1].length > 1 ? dateArr[1] : '0' + dateArr[1];
    dateArr[2] = dateArr[2].length > 1 ? dateArr[2] : '0' + dateArr[2];
    $('#submit_date').val(dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2]);
    $('#message').show();
    $('#floor_4').show();
    $('#floor_3').show();
    $('#floor_2').show();
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
        $('a[id^=seat_]').click(function(){
            select($(this));
            return false;
        });
        $('#submit').click(function(){
            commitData();
            return false;
        });
    });
});

