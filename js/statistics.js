var nowProgram = -1;
var data_floor1 = {};
var data_floor2_1 = [];
var data_floor2_2 = [];
var data_floor4 = [];
var data_floor5 = [];
var salerTable = [];
var departmentTable = ['Soprano', 'Alto', 'Tenor', 'Bass', '團外', '老師', '友團', '老人'];
var preserveTable = ['團員票', '老師票', '友團票', '老人票', 'VIP票', '系統票', '總計'];
var paymodeTable = ['付清', '賒帳'];
var priceTable = [];
var priceDiscountTable = [];

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#switcher').hide();
    $('#floor_statistic_1').hide();
    $('#floor_statistic_2').hide();
    $('#floor_statistic_3').hide();
    $('#floor_statistic_4').hide();
    $('#floor_statistic_5').hide();
    nowProgram = e.value;
    data_floor1 = {};
    data_floor2_1 = [];
    data_floor2_2 = [];
    data_floor4 = [];
    data_floor5 = [];
    salerTable = [];
    priceTable = [];
    priceDiscountTable = [];
    $('#select_viewprogram').html("");
    $('#container_floor1_data').html("");
    $('#container_floor2_1_data').html("");
    $('#container_floor2_2_data').html("");
    $('#container_floor4_data').html("");
    $('#container_floor5_data').html("");
    getData(nowProgram);
}

function showFloor1Entry(num, entry){
    var sale = entry['type0'] + entry['type1'] +  entry['type2'] + entry['type3'];
    var total = entry['type0_total'] + entry['type1_total'] +  entry['type2_total'] + entry['type3_total'];
    $('#container_floor1_data').append("<div class='list_entry container_floor1_data_entry'>" +
                                           "<div class='entry_1_type'>" + preserveTable[num] + "</div>" +
                                           "<div class='entry_1_type_0'>" + (entry['type0'] == 0 ? "" : entry['type0']) + "</div>" +
                                           "<div class='entry_1_type_0_total'>" + (entry['type0_total'] == 0 ? "" : entry['type0_total']) + "</div>" +
                                           "<div class='entry_1_type_0_rate'>" + (entry['type0_total'] == 0 ? "" : (entry['type0'] / entry['type0_total'] * 100).toFixed(1) + '%') + "</div>" +
                                           "<div class='entry_1_type_0_price'>" + (entry['type0_price'] == 0 ? "" : entry['type0_price']) + "</div>" +
                                           "<div class='entry_1_type_1'>" + (entry['type1'] == 0 ? "" : entry['type1']) + "</div>" +
                                           "<div class='entry_1_type_1_total'>" + (entry['type1_total'] == 0 ? "" : entry['type1_total']) + "</div>" +
                                           "<div class='entry_1_type_1_rate'>" + (entry['type1_total'] == 0 ? "" : (entry['type1'] / entry['type1_total'] * 100).toFixed(1) + '%') + "</div>" +
                                           "<div class='entry_1_type_1_price'>" + (entry['type1_price'] == 0 ? "" : entry['type1_price']) + "</div>" +
                                           "<div class='entry_1_type_2'>" + (entry['type2'] == 0 ? "" : entry['type2']) + "</div>" +
                                           "<div class='entry_1_type_2_total'>" + (entry['type2_total'] == 0 ? "" : entry['type2_total']) + "</div>" +
                                           "<div class='entry_1_type_2_rate'>" + (entry['type2_total'] == 0 ? "" : (entry['type2'] / entry['type2_total'] * 100).toFixed(1) + '%') + "</div>" +
                                           "<div class='entry_1_type_2_price'>" + (entry['type2_price'] == 0 ? "" : entry['type2_price']) + "</div>" +
                                           "<div class='entry_1_type_3'>" + (entry['type3'] == 0 ? "" : entry['type3']) + "</div>" +
                                           "<div class='entry_1_type_3_total'>" + (entry['type3_total'] == 0 ? "" : entry['type3_total']) + "</div>" +
                                           "<div class='entry_1_type_3_rate'>" + (entry['type3_total'] == 0 ? "" : (entry['type3'] / entry['type3_total'] * 100).toFixed(1) + '%') + "</div>" +
                                           "<div class='entry_1_type_3_price'>" + (entry['type3_price'] == 0 ? "" : entry['type3_price']) + "</div>" +
                                           "<div class='entry_1_totalrate'>" + (total == 0 ? "" : (sale / total * 100).toFixed(1) + '%') + "</div>" +
                                           "<div class='entry_1_totalprice'>" + entry['totalprice'] + "</div>" +
                                       "</div>");
}

function showFloor2Entry(i, entry){
    $('#container_floor2_' + i + '_data').append("<div class='list_entry container_floor2_data_entry'>" +
                                                     "<div class='entry_2_date'>" + entry['date'] + "</div>" +
                                                     "<div class='entry_2_type_0'>" + (entry['type0'] == 0 ? "" : entry['type0']) + "</div>" +
                                                     "<div class='entry_2_type_1'>" + (entry['type1'] == 0 ? "" : entry['type1']) + "</div>" +
                                                     "<div class='entry_2_type_2'>" + (entry['type2'] == 0 ? "" : entry['type2']) + "</div>" +
                                                     "<div class='entry_2_type_3'>" + (entry['type3'] == 0 ? "" : entry['type3']) + "</div>" +
                                                     "<div class='entry_2_discount'>" + (entry['discount'] == 0 ? "" : entry['discount']) + "</div>" +
                                                     "<div class='entry_2_totalprice'>" + entry['totalprice'] + "</div>" +
                                                 "</div>");
}

function showFloor4Entry(num, entry){
    $('#container_floor4_data').append("<div class='list_entry container_floor4_data_entry'>" +
                                           "<div class='entry_4_num'>" + num + "</div>" +
                                           "<div class='entry_4_buyer'>" + entry['buyer'] + "</div>" +
                                           "<div class='entry_4_department'>" + departmentTable[entry['department']] + "</div>" +
                                           "<div class='entry_4_type_0'>" + (entry['type0'] == 0 ? "" : entry['type0']) + "</div>" +
                                           "<div class='entry_4_type_1'>" + (entry['type1'] == 0 ? "" : entry['type1']) + "</div>" +
                                           "<div class='entry_4_type_2'>" + (entry['type2'] == 0 ? "" : entry['type2']) + "</div>" +
                                           "<div class='entry_4_type_3'>" + (entry['type3'] == 0 ? "" : entry['type3']) + "</div>" +
                                           "<div class='entry_4_discount'>" + (entry['discount'] == 0 ? "" : entry['discount']) + "</div>" +
                                           "<div class='entry_4_totalprice'>" + entry['totalprice'] + "</div>" +
                                           "<div class='entry_4_oweprice'>" + (entry['oweprice'] == 0 ? "" : entry['oweprice']) + "</div>" +
                                       "</div>");
}
function showFloor5Entry(num, entry){
    $('#container_floor5_data').append("<div class='list_entry container_floor5_data_entry'>" +
                                           "<div class='entry_5_num'>" + num + "</div>" +
                                           "<div class='entry_5_buyer'>" + entry['buyer'] + "</div>" +
                                           "<div class='entry_5_department'>" + departmentTable[entry['department']] + "</div>" +
                                           "<div class='entry_5_date'>" + entry['date'] + "</div>" +
                                           "<div class='entry_5_saler'>" + salerTable[entry['saler']] + "</div>" +
                                           "<div class='entry_5_type_0'>" + (entry['type0'] == 0 ? "" : entry['type0']) + "</div>" +
                                           "<div class='entry_5_type_1'>" + (entry['type1'] == 0 ? "" : entry['type1']) + "</div>" +
                                           "<div class='entry_5_type_2'>" + (entry['type2'] == 0 ? "" : entry['type2']) + "</div>" +
                                           "<div class='entry_5_type_3'>" + (entry['type3'] == 0 ? "" : entry['type3']) + "</div>" +
                                           "<div class='entry_5_paymode'>" + paymodeTable[entry['paymode']] + "</div>" +
                                           "<div class='entry_5_discount'>" + (entry['discount'] == 0 ? "" : entry['discount']) + "</div>" +
                                           "<div class='entry_5_totalprice'>" + entry['totalprice'] + "</div>" +
                                           "<div class='entry_5_oweprice'>" + (entry['oweprice'] == 0 ? "" : entry['oweprice']) + "</div>" +
                                       "</div>");
}

function sortFloor4Total(a, b){
    if(a['totalprice'] == b['totalprice'])
        return a['department'] - b['department'];
    else
        return b['totalprice'] - a['totalprice'];
}
function sortFloor4Department(a, b){
    if(a['department'] == b['department'])
        return b['totalprice'] - a['totalprice'];
    else
        return a['department'] - b['department'];
}
function relistFloor4(method){
    $('#container_floor4_data').html('');
    data_floor4.sort(method);
    for(var i = 0; i < data_floor4.length; i++)
        showFloor4Entry(i + 1, data_floor4[i]);
}
function sortFloor5Id(a, b){
    return a['id'] - b['id'];
}
function sortFloor5Date(a, b){
    if(a['date'] == b['date'])
        return a['id'] - b['id'];
    else
        return new Date(a['date']) - new Date(b['date']);
}
function relistFloor5(method){
    $('#container_floor5_data').html('');
    data_floor5.sort(method);
    for(var i = 0; i < data_floor5.length; i++)
        showFloor5Entry(i + 1, data_floor5[i]);
}


function showData(data){
    if(nowProgram == -1)
        nowProgram = data['mapattribute'][0]['currentdataid'];
    for(var i = 0; i < data['category'].length; i++){
        var addStr = "<option value='" + data['category'][i]['id'] + "'>" + data['category'][i]['year'];
        if(data['category'][i]['season'] == 0)
            addStr += '冬季';
        else
            addStr += '夏季';
        addStr += "《" + data['category'][i]['title'] + "》</option>";
        $('#select_viewprogram').append(addStr);
        if(data['category'][i]['id'] == nowProgram){
            $('#select_viewprogram').val(nowProgram);
        }
    }
    for(var i = 0; i < data['queryManager'].length; i++)
        salerTable[data['queryManager'][i]['id']] = data['queryManager'][i]['name'];
    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
    }

    /* Floor 1 table */
    for(var i = 0; i < 4; i++)
        $('.entry_1_type_' + i).html(priceTable[i]); 
    var data_floor1_total = {'type0': 0, 'type0_total': 0, 'type0_price': 0,  'type1': 0, 'type1_total': 0, 'type1_price': 0,  'type2': 0, 'type2_total': 0, 'type2_price': 0,  'type3': 0, 'type3_total': 0, 'type3_price': 0, 'totalprice': 0};
    for(var i = 0; i < 6; i++){
        if(i != 4){
            var insert = {'type0': 0, 'type0_total': 0, 'type0_price': 0,  'type1': 0, 'type1_total': 0, 'type1_price': 0,  'type2': 0, 'type2_total': 0, 'type2_price': 0,  'type3': 0, 'type3_total': 0, 'type3_price': 0, 'totalprice': 0};
            data_floor1[i] = insert;
        }
    }
    for(var i = 0; i < data['queryString_1'].length; i++){
        var insert = data['queryString_1'][i];
        if(insert['preserve'] != 4 && insert['preserve'] < 6){
            if(insert['state'] == 2){
                data_floor1[insert['preserve']]['type' + insert['type']] += insert['num'];
                data_floor1_total['type' + insert['type']] += insert['num'];
                var price = insert['num'] * priceTable[insert['type']];
                if(insert['preserve'] != 5)
                    price *= priceDiscountTable[insert['type']] / 100;
                data_floor1[insert['preserve']]['type' + insert['type'] + '_price'] += price;
                data_floor1[insert['preserve']]['totalprice'] += price;
                data_floor1_total['type' + insert['type'] + '_price'] += price;
                data_floor1_total['totalprice'] += price;
            }
            data_floor1[insert['preserve']]['type' + insert['type'] + '_total'] += insert['num'];
            data_floor1_total['type' + insert['type'] + '_total'] += insert['num'];
        }
    }
    data_floor1[6] = data_floor1_total;
    Object.keys(data_floor1).forEach(function(key, idx) {
        showFloor1Entry(key, data_floor1[key]);
    });

    /* Floor 2 table */
    var data_floor2_total_1 = {'date': '總計', 'type0': 0, 'type1': 0, 'type2': 0, 'type3': 0, 'discount': 0, 'totalprice': 0};
    var data_floor2_total_2 = {'date': '總計', 'type0': 0, 'type1': 0, 'type2': 0, 'type3': 0, 'discount': 0, 'totalprice': 0};
    for(var i = 0; i < 4; i++)
        $('.entry_2_type_' + i).html(priceTable[i] + '元'); 
    for(var i = 0; i < data['queryString_2a'].length; i++){
        var insert = data['queryString_2a'][i];
        insert['discount'] = data['queryString_2c'][i]['discount'];
        insert['totalprice'] -= data['queryString_2c'][i]['discount'];
        data_floor2_total_1['type0'] += insert['type0'];
        data_floor2_total_1['type1'] += insert['type1'];
        data_floor2_total_1['type2'] += insert['type2'];
        data_floor2_total_1['type3'] += insert['type3'];
        data_floor2_total_1['discount'] += insert['discount'];
        data_floor2_total_1['totalprice'] += insert['totalprice'];
        data_floor2_1.push(insert);
        showFloor2Entry(1, insert);
    }
    showFloor2Entry(1, data_floor2_total_1);
    for(var i = 0; i < data['queryString_2b'].length; i++){
        var insert = data['queryString_2b'][i];
        insert['discount'] = data['queryString_2d'][i]['discount'];
        insert['totalprice'] -= data['queryString_2d'][i]['discount'];
        data_floor2_total_2['type0'] += insert['type0'];
        data_floor2_total_2['type1'] += insert['type1'];
        data_floor2_total_2['type2'] += insert['type2'];
        data_floor2_total_2['type3'] += insert['type3'];
        data_floor2_total_2['discount'] += insert['discount'];
        data_floor2_total_2['totalprice'] += insert['totalprice'] - insert['discount'];
        data_floor2_2.push(insert);
        showFloor2Entry(2, insert);
    }
    showFloor2Entry(2, data_floor2_total_2);

    $('.container_floor2_sub').height(97 + Math.max(data_floor2_1.length, data_floor2_2.length) * 26);
    $('#floor_statistic_2').height(157 + Math.max(data_floor2_1.length, data_floor2_2.length) * 26);

    /* Floor 4 table */
    var data_floor4_creditlist = {};
    var data_floor4_discountlist = {};
    for(var i = 0; i < 4; i++)
        $('.entry_4_type_' + i).html(priceTable[i] + '元'); 
    for(var i = 0; i < data['queryString_4b'].length; i++)
        data_floor4_creditlist[data['queryString_4b'][i]['buyer']] = data['queryString_4b'][i]['price'];
    for(var i = 0; i < data['queryString_4c'].length; i++)
        data_floor4_discountlist[data['queryString_4c'][i]['buyer']] = data['queryString_4c'][i]['discount'];
    for(var i = 0; i < data['queryString_4a'].length; i++){
        var insert = data['queryString_4a'][i];
        insert['discount'] = data_floor4_discountlist[insert['buyer']];
        insert['totalprice'] -= insert['discount'];
        if(insert['buyer'] in data_floor4_creditlist)
            insert['oweprice'] -= data_floor4_creditlist[insert['buyer']];
        data_floor4.push(insert);
    }
    relistFloor4(sortFloor4Total);

    /* Floor 5 table */
    var data_floor5_creditlist = {};
    for(var i = 0; i < 4; i++)
        $('.entry_5_type_' + i).html(priceTable[i] + '元'); 
    for(var i = 0; i < data['queryString_5b'].length; i++)
        data_floor5_creditlist[data['queryString_5b'][i]['saleid']] = data['queryString_5b'][i]['price'];
    for(var i = 0; i < data['queryString_5a'].length; i++){
        var insert = data['queryString_5a'][i];
        insert['totalprice'] -= insert['discount'];
        if(insert['id'] in data_floor5_creditlist)
            insert['oweprice'] -= data_floor5_creditlist[insert['id']];
        data_floor5.push(insert);
    }
    relistFloor5(sortFloor5Id);

    $('#requesting').hide();
    $('#switcher').show();
    $('#floor_statistic_1').show();
    $('#floor_statistic_2').show();
    $('#floor_statistic_3').show();
    $('#floor_statistic_4').show();
    $('#floor_statistic_5').show();
}

function getData(pid){
    fbsdkCheckLogin(function(fbID, fbToken){
        var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqTotal'};
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
        $('#button4_sort_total').click(function(){
            relistFloor4(sortFloor4Total);
            return false;
        });
        $('#button4_sort_department').click(function(){
            relistFloor4(sortFloor4Department);
            return false;
        });
        $('#button5_sort_id').click(function(){
            relistFloor5(sortFloor5Id);
            return false;
        });
        $('#button5_sort_date').click(function(){
            relistFloor5(sortFloor5Date);
            return false;
        });
    });
    
});
