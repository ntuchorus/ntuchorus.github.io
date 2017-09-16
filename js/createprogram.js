var nowProgram = 0;
var nowFBID = 0;
var editManagerTable = {}; 
var salerTable = {};
var priceTable = [];

function inputValidNumber(e, pnumber){
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    if($(e).val() == '')
        $(e).val('0');
    if(parseInt($(e).val()) > $(e).attr('max'))
        $(e).val($(e).attr('max'));
    if(parseInt($(e).val()) < $(e).attr('min'))
        $(e).val($(e).attr('min'));
    var ticketType = -1;
    if(e.id.includes('input_price_type'))
        ticketType = parseInt(e.id.split("input_price_type")[1]);
    else if(e.id.includes('input_price_discount'))
        ticketType = parseInt(e.id.split("input_price_discount")[1]);
    if(ticketType != -1){
        $('#entry_price_type' + ticketType + '_0').html((parseInt($('#input_price_type' + ticketType).val()) * parseInt($('#input_price_discount' + ticketType).val()) / 100) + '元');
        $('#entry_price_type' + ticketType + '_1').html(parseInt($('#input_price_type' + ticketType).val()) + '元');
    }
    return false;
}

function commitCreateProgram(){
    var titleStr = $('#input_basic_year').val();
    if($('#select_basic_season').val() == 0)
        titleStr += '冬季音樂會《';
    else
        titleStr += '夏季音樂會《';
    titleStr += $('#input_basic_title').val() + '》';
    if($('#input_basic_title').val() == "")
        alert("音樂會標題不得為空白");
    else if (confirm('是否確定建立新場次：' + titleStr + '？\n請注意，送出後場次資訊無法修改！')) {
        $('#requesting').html('新建資料庫......');
        $('#requesting').show();
        $('#inform_basic').hide();
        $('#inform_manager').hide();
        $('#inform_price').hide();
        $('#inform_submit').hide();
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'year': parseInt($('#input_basic_year').val()), 'season': parseInt($('#select_basic_season').val()),
                           'title': $('#input_basic_title').val(), 'mapid': parseInt($('#select_basic_mapid').val()),
                           'programprice': parseInt($('#input_price_program').val())};
            dataset['manager'] = [];
            for(var i = 1; i <= 4; i++){
                if($('#select_manager_admin_' + i).val() != -1)
                    dataset['manager'].push({'id': parseInt($('#select_manager_admin_' + i).val()), 'department': 0});
            }
            for(var i = 1; i <= 4; i++)
                dataset['manager'].push({'id': parseInt($('#select_manager_saler_' + i).val()), 'department': i});
            dataset['price'] = [];
            for(var i = 0; i < 4; i++)
                dataset['price'].push({'id': i, 'price': parseInt($('#input_price_type' + i).val()), 'discount': parseInt($('#input_price_discount' + i).val())});
            dataset['price'].push({'id': 4, 'price': 0, 'discount': 100});

            var commit = {'id': fbID, 'token': fbToken, 'cmd': 'creNewProgram', data: dataset};
            connectServer('POST',
                          JSON.stringify(commit),
                          'create',
                          function(data){
                if(data["status"] == "0")
                    $('#requesting').html('建檔完成');
                else if(data["status"] == "2")
                    $('#requesting').html('權限不足');
                else
                    $('#requesting').html('寫入失敗，請稍候再試或聯絡管理員');
            });
        });
    }
    return false;
}

function showData(data) {
    nowProgram = data['mapattribute'][0]['currentdataid'];
    var nowCategory;
    for(var i = 0; i < data['category'].length; i++){
        if(data['category'][i]['id'] == nowProgram)
            nowCategory = data['category'][i];
    }
    
    $('#input_basic_year').val((new Date()).getFullYear());
    $('#input_basic_year').attr('min', (new Date()).getFullYear());
    $('#input_basic_year').attr('max', 9999);
    for(var i = 0; i < data['mapindex'].length; i++)
        $('#select_basic_mapid').append("<option value='" + data['mapindex'][i]['id'] + "'>" + data['mapindex'][i]['name'] + '</option>');

    for(var i = 0; i < data['manager'].length; i++){
        if(data['manager'][i]['fbid'] == nowFBID){
            $('#select_manager_admin_1').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_admin_1').val(data['manager'][i]['id']);
            $('#select_manager_admin_1').attr('disabled', 'disabled');
        }
        else if(data['manager'][i]['permission'] >= 3){
            $('#select_manager_admin_2').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_admin_3').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_admin_4').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
        }
        else if(data['manager'][i]['permission'] == 1){
            $('#select_manager_saler_1').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_saler_2').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_saler_3').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
            $('#select_manager_saler_4').append("<option value='" + data['manager'][i]['id'] + "'>" + data['manager'][i]['name'] + '</option>');
        }
    }

    for(var i = 0; i < data['price'].length; i++){
        $('#input_price_type' + data['price'][i]['id']).val(data['price'][i]['price']);
        $('#input_price_discount' + data['price'][i]['id']).val(data['price'][i]['discount']);
        $('#entry_price_type' + data['price'][i]['id'] + '_0').html((data['price'][i]['price'] * data['price'][i]['discount'] / 100) + '元');
        $('#entry_price_type' + data['price'][i]['id'] + '_1').html(data['price'][i]['price'] + '元');
    }
    $('#input_price_program').val(nowCategory['programprice']);
    $('input[id^=input_price_discount]').attr('max', 100);
    $('input[id^=input_price_discount]').attr('min', 0);

    $('#requesting').hide();
    $('#inform_basic').show();
    $('#inform_manager').show();
    $('#inform_price').show();
    $('#inform_submit').show();
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            nowFBID = fbID;
            var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqNewCategory'};
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

            $('#submit_createprogram').click(commitCreateProgram);
        });
    });
});

