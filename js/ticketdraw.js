var nowProgram = -1;
var ticketTable = {};
var priceTable = [];
var priceDiscountTable = [];
var editTicketTable = {};
var typeSelected = [];
var priceSelected = 0;
var showTable = {'0': true, '1': false, '2': false, '3': false, '5': false};

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('#floor_type').hide();
    $('#floor_4').hide();
    $('#floor_3').hide();
    $('#floor_2').hide();
    $('#form').hide();
    nowProgram = e.value;
    ticketTable = {};
    priceTable = [];
    priceDiscountTable = [];
    editTicketTable = {};
    typeSelected = [];
    priceSelected = 0;
    $('#select_viewprogram').html("");
    $('#form_label').html('選取總金額：0元');
    getData(nowProgram);
}

function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    
    $('#' + id).attr('class', 'seat');
    if(showTable[finalPreserve]) {
        if(id in editTicketTable){
            $('#' + id).addClass('seat_select');
        }
        else{
            if(finalState == 2)
                $('#' + id).addClass('seat_type_b');
            else if(finalState == 1)
                $('#' + id).addClass('seat_type_a');
            else
                $('#' + id).addClass('seat_type_' + finalType);
        }
    }
    else {
        if(id in editTicketTable){
            delete editTicketTable[id];
            if(finalPreserve == 5)
                priceSelected -= priceTable[finalType];
            else
                priceSelected -= priceTable[finalType] * priceDiscountTable[finalType] / 100;
            typeSelected[finalType] -= 1;
            $('#submit_count_type' + finalType).html(typeSelected[finalType]);
            $('#form_label').html('選取總金額：' + priceSelected + '元');
        }
        $('#' + id).addClass('seat_type_c');
    }
}

function showIconGraph(){
    var str = "";
    for(var i = 0; i < priceTable.length - 1; i++){
        str += "<div class='block_graph'>" +
                   "<div class='graphicon_" + i + "'></div>" +
                   "<div class='graphlabel_" + i + "'>" + priceTable[i] + "元</div>" +
               "</div>";
    }
    str += "<div class='block_graph'>" +
               "<div class='graphicon_a'></div>" +
               "<div class='graphlabel_pres'>已劃票</div>" +
           "</div>" +
           "<div class='block_graph'>" +
               "<div class='graphicon_b'></div>" +
               "<div class='graphlabel_sale'>已售票</div>" +
           "</div>" +
           "<div class='block_graph'>" +
               "<div class='graphicon_c'></div>" +
               "<div class='graphlabel_forb'>不販售</div>" +
           "</div>";
    $(".container_graph").html(str).css('width', 105 * (priceTable.length + 2));
}

function showSaleData(box) {
    if(box.checked)
        showTable[box.value] = true;
    else
        showTable[box.value] = false;
    Object.keys(ticketTable).forEach(function(key, idx) {
        updateSeat(key);
    });
}

function showTypeSelected() {
    var str = "";
    for(var i = 0; i < priceTable.length - 1; i++)
        str += "<div id='submit_count_type" + i + "'>0</div>";
    $('#submit_count').html(str);
    $('#submit_count').css('margin-left', 500 - ((priceTable.length - 1) * 70 - 20) / 2);
}

function select(a) {
    var click_id = a.attr('id');
    var click_type = ticketTable[click_id]['type'];
    var click_preserve = ticketTable[click_id]['preserve'];
    var click_price = priceTable[click_type];
    if(click_preserve != 5)
        click_price = click_price * priceDiscountTable[click_type] / 100;
    
    if(click_preserve != 4 && showTable[click_preserve]){
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
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updDraw', 'data': dataset, 'mode': mode, 'programid': nowProgram};
        connectServer('POST',
                      JSON.stringify(commit),
                      'update',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else if(data["status"] == "2")
                alert('權限不足，僅該場公演的售票小天使及票務團秘可以劃票');
            else
                alert('寫入失敗，請稍候再試或聯絡管理員');
        });
    });
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
    showIconGraph();
    showTypeSelected();

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
        ticketTable[seat_id] = arr;
        updateSeat(seat_id);
    }

    $('#message').show();
    $('#floor_type').show();
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
