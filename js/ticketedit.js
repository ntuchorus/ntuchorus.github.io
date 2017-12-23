var nowProgram = -1;
var data_credit = [];
var data_payment = [];
var data_index = {};
var salerTable = [];
var departmentTable = ['Soprano', 'Alto', 'Tenor', 'Bass', '團外', '老師', '友團', '老人'];
var preserveTable = ['團員票', '老師票', '友團票', '老人票', 'VIP票', '系統票', '總計'];
var paymodeTable = ['付清', '賒帳'];
var priceTable = [];
var priceDiscountTable = [];
var dateString = "";

function programChange(e){
    $('#requesting').html("正在讀取座位圖資訊......");
    $('#requesting').show();
    $('#message').hide();
    $('#floor_credit').hide();
    $('#floor_payment').hide();
    nowProgram = e.value;
    data_credit = [];
    data_payment = [];
    salerTable = [];
    priceTable = [];
    priceDiscountTable = [];
    $('#select_viewprogram').html("");
    $('#container_floor_credit_data').html("");
    $('#container_floor_payment_data').html("");
    getData(nowProgram);
}

function inputValidNumber(e, pnumber){
    var saleid = parseInt($(e).attr("id").split("_")[3]);
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    if($(e).val() == '')
        $(e).val('0');
    if($(e).val() > data_index[saleid]['oweprice'])
        $(e).val(data_index[saleid]['oweprice']);
    return false;
}

function showListHead(){
    var strCredit = "<div class='entry_num'>#</div>" + 
              "<div class='entry_buyer'>姓名</div>" +
              "<div class='entry_department'>聲部</div>" +
              "<div class='entry_date'>售票日期</div>" +
              "<div class='entry_saler'>負責人</div>";
    for(var i = 0; i < priceTable.length - 1; i++)
        strCredit += "<div class='entry_type_" + i + "'></div>";
    var strPayment = strCredit + "<div class='entry_paymode'>模式</div>";
    var str = "<div class='entry_discount'>折扣</div>" +
              "<div class='entry_totalprice'>總價</div>" +
              "<div class='entry_oweprice'>欠款</div>";
    $('#container_floor_credit_label').html(strCredit + str);
    $('#container_floor_payment_label').html(strPayment + str);
}
function showCreditEntry(num, entry){
    var str = "<div class='list_entry container_floor_credit_data_entry'>" +
              "<div class='entry_credit_content'>" +
              "<div class='entry_num'>" + num + "</div>" +
              "<div class='entry_buyer'>" + entry['buyer'] + "</div>" +
              "<div class='entry_department'>" + departmentTable[entry['department']] + "</div>" +
              "<div class='entry_date'>" + entry['date'] + "</div>" +
              "<div class='entry_saler'>" + salerTable[entry['saler']] + "</div>";
    for(var i = 0; i < priceTable.length - 1; i++)
        str += "<div class='entry_type_" + i + "'>" + (entry['type' + i] == 0 ? "" : entry['type' + i]) + "</div>";
    str += "<div class='entry_discount'>" + (entry['discount'] == 0 ? "" : entry['discount']) + "</div>" +
           "<div class='entry_totalprice'>" + entry['totalprice'] + "</div>" +
           "<div class='entry_oweprice'>" + (entry['oweprice'] == 0 ? "" : entry['oweprice']) + "</div>" +
           "</div><div class='entry_credit_form'>" +
           "<div class='entry_submit_date'>付款日期：<input type='date' id='input_submit_date_" + entry['id'] + "' value='" + dateString + "'/></div>" +
           "<div class='entry_submit_price'>付款金額：<input type='text' id='input_submit_price_" + entry['id'] + "' value='0' onkeyup='return inputValidNumber($(this), value)'/></div>" +
           "<div class='entry_submit_button'><a id='button_submit_credit_" + entry['id'] + "' href='#'>登記</a></div>" +
           "</div></div>";
    $('#container_floor_credit_data').append(str);
}
function showPaymentEntry(num, entry){
    var str = "<div class='list_entry container_floor_payment_data_entry'>" +
              "<div class='entry_payment_content'>" +
              "<div class='entry_num'>" + num + "</div>" +
              "<div class='entry_buyer'>" + entry['buyer'] + "</div>" +
              "<div class='entry_department'>" + departmentTable[entry['department']] + "</div>" +
              "<div class='entry_date'>" + entry['date'] + "</div>" +
              "<div class='entry_saler'>" + salerTable[entry['saler']] + "</div>";
    for(var i = 0; i < priceTable.length - 1; i++)
        str += "<div class='entry_type_" + i + "'>" + (entry['type' + i] == 0 ? "" : entry['type' + i]) + "</div>";
    str += "<div class='entry_paymode'>" + paymodeTable[entry['paymode']] + "</div>" +
           "<div class='entry_discount'>" + (entry['discount'] == 0 ? "" : entry['discount']) + "</div>" +
           "<div class='entry_totalprice'>" + entry['totalprice'] + "</div>" +
           "<div class='entry_oweprice'>" + (entry['oweprice'] == 0 ? "" : entry['oweprice']) + "</div>" +
           "<div class='entry_submit_button'><a id='button_delete_payment_" + entry['id'] + "' href='#'>刪除</a></div>" +
           "</div>";
    for(var i = 0; 'credit' in entry && i < entry['credit'].length; i++){
        str += "<div class='entry_payment_form'>" +
               "<div class='entry_num'>" + (i + 1) + "</div>" +
               "<div class='entry_date_label'>付款日期：</div>" +
               "<div class='entry_date'>" + entry['credit'][i]['date'] + "</div>" +
               "<div class='entry_totalprice_label'>付款金額：</div>" +
               "<div class='entry_totalprice'>" + entry['credit'][i]['price'] + "</div>" +
               "<div class='entry_submit_button'><a id='button_delete_credit_" + entry['credit'][i]['id'] + "' href='#'>刪除</a></div>" +
               "</div>";
    }
    str += "</div>";
    $('#container_floor_payment_data').append(str);
}

function sortDataId(a, b){
    return a['id'] - b['id'];
}
function sortDataDate(a, b){
    if(a['date'] == b['date'])
        return a['id'] - b['id'];
    else
        return new Date(a['date']) - new Date(b['date']);
}
function relistCredit(method){
    $('#container_floor_credit_data').html('');
    data_credit.sort(method);
    for(var i = 0; i < data_credit.length; i++)
        showCreditEntry(i + 1, data_credit[i]);
    $('.container_floor_credit_data_entry').css('width', 620 + (priceTable.length - 1) * 40);
    $('.entry_credit_form').css('margin-left', (100 + (priceTable.length - 1) * 40) / 2);
}
function relistPayment(method){
    $('#container_floor_payment_data').html('');
    data_payment.sort(method);
    for(var i = 0; i < data_payment.length; i++)
        showPaymentEntry(i + 1, data_payment[i]);
    $('.container_floor_payment_data_entry').css('width', 730 + (priceTable.length - 1) * 40);
    $('.entry_payment_form').css('margin-left', (180 + (priceTable.length - 1) * 40) / 2);
}

function commitAddCredit(button){
    var id = button.attr('id').split("button_submit_credit_")[1];
    if($('#input_submit_date_' + id).val() == "")
        alert('日期不得為空白');
    else if($('#input_submit_price_' + id).val() == "0")
        alert('價格不得為0');
    else{
        var dataset = {};
        dataset['saleid'] = parseInt(id);
        dataset['time'] = $('#input_submit_date_' + id).val();
        dataset['price'] = parseInt($('#input_submit_price_' + id).val());
        console.log(dataset);
        fbsdkCheckLogin(function(fbID, fbToken){
            var commit = {'id': fbID, 'token': fbToken, 'cmd': 'creCreditPayment', 'data': dataset, 'programid': nowProgram};
            connectServer('POST',
                          JSON.stringify(commit),
                          'create',
                          function(data){
                if(data["status"] == "0")
                    window.location.reload();
                else if(data["status"] == "2")
                    alert('權限不足，僅該場音樂會的票務團秘可以登記賒帳付款');
                else
                    alert('寫入失敗，請稍候再試或聯絡管理員');
            });
        });
    }
    return false;
}

function commitDelete(button){
    var id = button.attr('id').split("_");
    var cmd = "";
    if(id[2] == 'credit')
        cmd = 'delCreditPay';
    else if(id[2] == 'payment')
        cmd = 'delSaleTicket';
    var dataset = {};
    dataset['id'] = parseInt(id[3]);
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': cmd, 'data': dataset, 'programid': nowProgram};
        connectServer('POST',
                      JSON.stringify(commit),
                      'delete',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else if(data["status"] == "2")
                alert('權限不足，僅該場音樂會的票務團秘可以刪除售票付款記錄');
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

    for(var i = 0; i < data['queryManager'].length; i++)
        salerTable[data['queryManager'][i]['id']] = data['queryManager'][i]['name'];
    for(var i = 0; i < data['price'].length; i++){
        priceTable[data['price'][i]['id']] = data['price'][i]['price'];
        priceDiscountTable[data['price'][i]['id']] = data['price'][i]['discount'];
    }

    showListHead();
    for(var i = 0; i < data['price'].length - 1; i++)
        $('.entry_type_' + i).html(priceTable[i]); 
    for(var i = 0; i < data['queryString_5a'].length; i++){
        var insert = data['queryString_5a'][i];
        insert['totalprice'] -= insert['discount'];
        if(insert['paymode'] == 1){
            insert['credit'] = [];
            insert['oweprice'] -= insert['discount'];
        }
        for(var j = 0; j < data['queryString_3'].length; j++){
            if(data['queryString_3'][j]['saleid'] == insert['id']){
                insert['credit'].push(data['queryString_3'][j]);
                insert['oweprice'] -= data['queryString_3'][j]['price'];
            }
        }
        if(insert['paymode'] == 1 && insert['oweprice'] > 0)   
            data_credit.push(insert);
        data_payment.push(insert);
        data_index[insert['id']] = insert;
    }
    relistCredit(sortDataId);
    relistPayment(sortDataId);
    $('#container_floor_credit_label').css('width', 620 + (priceTable.length - 1) * 40);
    $('#container_floor_payment_label').css('width', 730 + (priceTable.length - 1) * 40);
    
    $('a[id^=button_submit_credit_]').click(function(){
        commitAddCredit($(this));
        return false;
    });
    $('a[id^=button_delete_]').click(function(){
        commitDelete($(this));
        return false;
    });

    $('#requesting').hide();
    $('#message').show();
    $('#floor_credit').show();
    $('#floor_payment').show();
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
        var dateArr = new Date().toLocaleDateString().split('/');
        dateArr[1] = dateArr[1].length > 1 ? dateArr[1] : '0' + dateArr[1];
        dateArr[2] = dateArr[2].length > 1 ? dateArr[2] : '0' + dateArr[2];
        dateString = dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2];
        getData(nowProgram);
        $('#button_credit_sort_id').click(function(){
            relistCredit(sortDataId);
            return false;
        });
        $('#button_credit_sort_date').click(function(){
            relistCredit(sortDataDate);
            return false;
        });
        $('#button_payment_sort_id').click(function(){
            relistPayment(sortDataId);
            return false;
        });
        $('#button_payment_sort_date').click(function(){
            relistPayment(sortDataDate);
            return false;
        });
    });
    
});
