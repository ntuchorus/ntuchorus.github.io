var nowProgram = -1;
var ticketTable = {};
var priceTable = [];
var preserveTable = {'0': '一般票', '1': '老師票', '2': '友團票', '3': '老人票', '4': 'VIP票', '5': '系統票', '6': '工作席'};
var priceDiscountTable = [];
var editTicketTableType = {};
var editTicketTablePreserve = {};
var editSelector = 0;
/* 10: 400  11: 700  12: 1000  13: 1500  */
/* 20: none 21: teacher 22: friend 23:old 24: vip 25: system 26: work */

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('#selector').hide();
    $('div[id^=floor_]').remove();
    $('#form').hide();
    nowProgram = e.value;
    ticketTable = {};
    priceTable = [];
    priceDiscountTable = [];
    editTicketTableType = {};
    editTicketTablePreserve = {};
    editSelector = 0;
    $('#select_viewprogram').html("");
    getData(nowProgram);
}

function pickSelector(a) {
    var id = a.find('div[class^=graphicon_]').attr('class').split('_');
    if(id[1] == 'type'){
        editSelector = 10 + parseInt((id[2] == 'v') ? (priceTable.length - 1) : id[2]);
    }
    else
        editSelector = 20 + parseInt(id[2]);
    return false;
}

function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    if(id in editTicketTableType)
        finalType = editTicketTableType[id];
    if(id in editTicketTablePreserve)
        finalPreserve = editTicketTablePreserve[id];
    if(finalType == priceTable.length - 1)
        finalType = 'v';

    var classStr = 'seat';
    if(finalPreserve > 0){
        classStr += ' seat_preserve_' + finalPreserve;
        if($('#isShowSaled').prop('checked')){
            if(finalState == 0)
                classStr += ' seat_type_' + finalType;
            else
                classStr += ' seat_state_' + finalState;
        }
        else
            classStr += ' seat_type_' + finalType;
    }
    else{
        classStr += ' seat_type_' + finalType;
        if($('#isShowSaled').prop('checked')){
            if(finalState == 0)
                classStr += ' seat_type_' + finalType + ' seat_type_b_' + finalType;
            else
                classStr += ' seat_state_' + finalState + ' seat_state_b_' + finalState;
        }
        else
            classStr += ' seat_type_b_' + finalType;
    }
    return classStr;
}

function showIconGraph(){
    var str = "";
    for(var i in preserveTable){
        str += "<div class='block_graph'><a href='#'>" +
                   "<div class='graphicon_preserve_" + i + "'></div>" +
                   "<div class='graphlabel'>" + preserveTable[i] + "</div>" +
               "</a></div>";
    }
    for(var i = 0; i < priceTable.length - 1; i++){
        str += "<div class='block_graph'><a href='#'>" +
                   "<div class='graphicon_type_" + i + "'></div>" +
                   "<div class='graphlabel_" + i + "'>" + priceTable[i] + "元</div>" +
               "</a></div>";
    }
    str += "<div class='block_graph'><a href='#'>" +
               "<div class='graphicon_type_v'></div>" +
               "<div class='graphlabel_v'>VIP</div>" +
           "</a></div>";
    $(".container_graph").html(str);
    $('div[class=block_graph] a').click(function(){
        pickSelector($(this));
        return false;
    });
}

function showSaleData(box) {
    Object.keys(ticketTable).forEach(function(key, idx) {
        $('#' + key).attr('class', updateSeat(key));
    });
}

function select(a) {
    var click_id = a.attr('id');
    if(editSelector >= 10 && editSelector < 20){ //type
        if(click_id in editTicketTableType)
            delete editTicketTableType[click_id];
        else
            editTicketTableType[click_id] = editSelector % 10;
    }
    else if(editSelector >= 20 && editSelector < 30){ //preserve
        if(click_id in editTicketTablePreserve)
            delete editTicketTablePreserve[click_id];
        else
            editTicketTablePreserve[click_id] = editSelector % 10;
    }
    $('#' + click_id).attr('class', updateSeat(click_id));
    return false;
}

function commitData(){
    var dataset = {};
    for(var id in editTicketTableType)
        dataset[id] = {'id': ticketTable[id]['id'], 'type': editTicketTableType[id], 'preserve': ticketTable[id]['preserve']};
    for(var id in editTicketTablePreserve){
        if(id in dataset)
            dataset[id]['preserve'] = editTicketTablePreserve[id];
        else
            dataset[id] = {'id': ticketTable[id]['id'], 'type': ticketTable[id]['type'], 'preserve': editTicketTablePreserve[id]};
    }
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updSetTicket', 'data': dataset, 'programid': nowProgram};
        connectServer('POST',
                      JSON.stringify(commit),
                      'update',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else if(data["status"] == "2")
                alert('權限不足，僅該場公演的票務團秘可以設定票券資訊');
            else
                alert('寫入失敗，請稍候再試或聯絡管理員');
        });
    });
    return false;
}

function commitClear(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updClearPreserve', 'programid': nowProgram};
        connectServer('POST',
                      JSON.stringify(commit),
                      'update',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else
                $('#requesting').html('寫入失敗');
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
    }

    var mapCode = getMapCode(data['ticket'], 'a', false, nowCategory['mapwidth'], function(item){
        var seat_id = 'seat_' + item['floor'] + '_' + item['row'] + '_' + item['seat'];
        var arr = {};
        arr['id'] = parseInt(item['id']);
        arr['state'] = parseInt(item['state']);
        arr['type'] = parseInt(item['type']);
        arr['preserve'] = parseInt(item['preserve']);
        ticketTable[seat_id] = arr;
        return updateSeat(seat_id);
    });
    for(var i = 0; i < mapCode.length; i++)
        $(mapCode[i]).insertAfter($("#selector"));
    showIconGraph();
    $('a[id^=seat_]').click(function(){
        select($(this));
        return false;
    });
    $('#message').show();
    $('#selector').show();
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
        $('#submit_change').click(commitData);
        $('#submit_clear').click(commitClear);
    });
});

