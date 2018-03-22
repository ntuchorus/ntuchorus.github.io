var nowProgram = -1;
var priceTable = [];

function programChange(e){
    $('#programtitle').html("台大合唱團音樂會座位圖");
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('div[id^=floor_]').remove();
    $('#statistic').hide();
    nowProgram = e.value;
    priceTable = [];
    $('#select_viewprogram').html("");
    getData(nowProgram);
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
               "<div class='graphlabel_forb'>已劃票</div>" +
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

function showStatistics(sale, total, dm){
    var entry_len = 960 / (priceTable.length - 1);
    var str = "";
    for(var i = 0; i < priceTable.length - 1; i++){
        var rate = ((sale[i] / total[i]) * 100).toFixed(1);
        str += "<div class='statistic_entry' style='width: " + entry_len + "px;'>" +
                   "<div class='statistic_label' id='statistic_label_" + i + "'>" + priceTable[i] + '元：' + rate + '%' + "</div>" +
                   "<div class='statistic_bar' id='statistic_bar_" + i + "' style='width: " + (entry_len - 20) + "px;'>" +
                       "<div class='statistic_bar_progress' id='statistic_bar_progress_" + i + "' style='width: " + (rate * (entry_len - 20) / 100).toFixed() + "px;'></div>" +
                   "</div>" +
               "</div>";
    }
    str += "<div class='statistic_entry_full'>" +
               "<div class='statistic_label' id='statistic_label_total'>總售票率：" + (sale[priceTable.length - 1] / total[priceTable.length - 1] * 100).toFixed(1) + '%' + "</div>" +
               "<div class='statistic_bar' id='statistic_bar_total'>" +
                   "<div class='statistic_bar_progress' id='statistic_bar_progress_total' style='width: " + (sale[priceTable.length - 1] / total[priceTable.length - 1] * 460).toFixed() + "'></div>" +
               "</div>" +
           "</div>" +
           "<div class='statistic_entry_full'>" +
               "<div class='statistic_label' id='statistic_label_DM'>" + "DM發送量： [" + dm['dmsale'] + ' / ' + dm['dmtotal'] + '] ' + (dm['dmtotal'] == 0 ? 0 : ((dm['dmsale'] / dm['dmtotal'] * 100).toFixed(1))) + '%' + "</div>" +
               "<div class='statistic_bar_full' id='statistic_bar_DM'>" +
                   "<div class='statistic_bar_progress' id='statistic_bar_progress_DM' style='width: " + ((dm['dmtotal'] == 0 ? 0 : (dm['dmsale'] / dm['dmtotal'])) * 460).toFixed() + "'></div>" +
               "</div>" +
           "</div>";
    $(".container_statistic").html(str);
}

function showData(data){
    if(nowProgram == -1)
        nowProgram = data['mapattribute'][0]['currentdataid'];
    var statistic_sale = [], statistic_total = [], nowCategory;
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
    var titleStr = '台大合唱團' + nowCategory['year'];
    if(nowCategory['season'] == 0)
        titleStr += '冬季音樂會《';
    else
        titleStr += '夏季音樂會《';
    titleStr += nowCategory['title'] + '》座位圖';
    $('#programtitle').html(titleStr);

    $('#update_date').html('更新時間：' + nowCategory['time'] + '　　　瀏覽次數：' + data['mapattribute'][0]['counter']);
    $('#update_message').html(nowCategory['message']);
    $('#requesting').hide();
    for(var i = 0; i < data['price'].length; i++){
        statistic_sale[i] = 0;
        statistic_total[i] = 0;
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
    }
    for(var i = 0; i < data['percentage'].length; i++){
        statistic_total[data['percentage'][i]['type']] += parseInt(data['percentage'][i]['num']);
        statistic_total[data['price'].length - 1] += parseInt(data['percentage'][i]['num']);
        if(parseInt(data['percentage'][i]['state']) == 2){
            statistic_sale[data['percentage'][i]['type']] += parseInt(data['percentage'][i]['num']);
            statistic_sale[data['price'].length - 1] += parseInt(data['percentage'][i]['num']);
        }
    }

    var mapCode = getMapCode(data['ticket'], 'div', true, nowCategory['mapwidth'], function(item){
        var seat_state = parseInt(item['state']);
        var seat_type = parseInt(item['type']);
        var seat_preserve = parseInt(item['preserve']);
        var classStr = 'seat';
        if(seat_preserve > 0 && data['mapattribute'][0]['isshowhidden'] == 0)
            classStr += ' seat_type_c';
        else if((seat_preserve == 1 || seat_preserve >= 4) && data['mapattribute'][0]['isshowhidden'] == 1)
            classStr += ' seat_type_c';
        else if(seat_state == 2)
            classStr += ' seat_type_b';
        else if(seat_state == 1)
            classStr += ' seat_type_a';
        else{
            if(seat_type >= data['price'].length - 1)
                classStr += ' seat_type_c';
            else
                classStr += ' seat_type_' + seat_type;
        }
        return classStr;
    });

    for(var i = 0; i < mapCode.length; i++)
        $(mapCode[i]).insertAfter($("#message"));

    showStatistics(statistic_sale, statistic_total, nowCategory);
    showIconGraph();
    $('#message').show();
    $('div[id^=floor_]').show();
    $('#statistic').show();
}

function getData(pid){
    var dataset = {'id': 'guest', 'cmd': 'reqMap'};
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
}

$(document).ready(function(){
    getData(nowProgram);
});
