var nowProgram = 0;
var nowFBID = 0;
var editManagerTable = {}; 
var salerTable = {};

function inputValidNumber(e, pnumber){
    if(!/\d+$/.test(pnumber))
        $(e).val(/\d+/.exec($(e).val()));
    return false;
}

function recordPermissionChange(element){
    var uid = parseInt(element.id.split("select_manager_permission_")[1]);
    if(uid in editManagerTable)
        editManagerTable[uid]['permission'] = parseInt(element.value);
    else
        editManagerTable[uid] = {'name': $("#input_manager_name_" + uid).val(), 'permission': parseInt(element.value)};
}
function recordNameChange(element){
    var uid = parseInt(element.id.split("input_manager_name_")[1]);
    if(element.value == "")
        element.value = salerTable[uid]['name'];
    if(uid in editManagerTable)
        editManagerTable[uid]['name'] = element.value;
    else
        editManagerTable[uid] = {'name': element.value, 'permission': parseInt($("#select_manager_permission_" + uid).val())};
}

function commitAttribute(){
    if($('#input_message').val() == "")
        alert('公告訊息不得為空白');
    else {
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'message': $('#input_message').val(), 'dmsale': $('#input_DM_given').val(), 'dmtotal': $('#input_DM_total').val(),
                           'programsale': $('#input_program_sale').val(), 'programcoupon': $('#input_program_coupon').val()};
            var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updAttribute', 'data': dataset};
            connectServer('POST',
                          JSON.stringify(commit),
                          'update',
                          function(data){
                if(data["status"] == "0")
                    window.location.reload();
                else if(data["status"] == "2")
                    alert('權限不足');
                else
                    alert('寫入失敗，請稍候再試或聯絡管理員');
            });
        });
    }
    return false;
}

function commitSetting(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var dataset = {'currentdataid': $('#select_setting_currentdata').val()};
        if($('#input_setting_isshowhidden').is(":checked"))
            dataset['isshowhidden'] = 1;
        else
            dataset['isshowhidden'] = 0;
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updSettings', data: dataset};
        connectServer('POST',
                      JSON.stringify(commit),
                      'update',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else if(data["status"] == "2")
                alert('權限不足');
            else
                alert('寫入失敗，請稍候再試或聯絡管理員');
        });
    });
    return false;
}

function commitManager(){
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'updManager', data: editManagerTable};
        connectServer('POST',
                      JSON.stringify(commit),
                      'update',
                      function(data){
            if(data["status"] == "0")
                window.location.reload();
            else if(data["status"] == "2")
                alert('權限不足');
            else
                alert('寫入失敗，請稍候再試或聯絡管理員');
        });
    });
    return false;
}

function showCategoryEntry(data){
    var titleStr = data['year'];
    if(data['season'] == 0)
        titleStr += '冬季《';
    else
        titleStr += '夏季《';
    titleStr += data['title'] + '》';
    $('#select_setting_currentdata').append("<option value='" + data['id'] + "'>" + titleStr + '</option>');
}

function showMemberEntry(data){
    var str = "<div class='list_entry manager_data_entry'>" + 
                  "<div class='entry_manager_fb'><a target='_blank' href='https://www.facebook.com/" + data['fbid'] + "'>Facebook頁面</a></div>" +
                  "<div class='entry_manager_name'><input type='text' id='input_manager_name_" + data['id'] + "' name='form_manager_name_" + data['id'] + "' value='" + data['name'] + "' onChange='recordNameChange(this)'/></div>" +
                  "<div class='entry_manager_permission'><form>" +
                      "<select id='select_manager_permission_" + data['id'] + "' onChange='recordPermissionChange(this)'>";
    if(data['permission'] == 0)
        str += "<option value='0'>尚未核可</option>";
    else if(data['permission'] == 4)
        str += "<option value='4'>系統管理員</option>";
    str +=                "<option value='1'>售票小天使</option>" +
                          "<option value='2'>大頭群</option>" +
                          "<option value='3'>票務團秘</option>" +
                      "</select></form>" +
                  "</div>" +
              "</div>";

    $('#manager_data').append(str);
    if(data['permission'] == 4 || nowFBID == data['fbid'])
        $('#select_manager_permission_' + data['id']).attr('disabled', 'disabled');
    if(data['permission'] == 4 && nowFBID != data['fbid'])
        $('#input_manager_name_' + data['id']).attr('readonly', 'readonly');
    $('#select_manager_permission_' + data['id']).val(data['permission']);
    salerTable[data['id']] = data;
}

function showData(data){
    nowProgram = data['mapattribute'][0]['currentdataid'];
    var nowCategory;
    for(var i = 0; i < data['category'].length; i++){
        if(data['category'][i]['id'] == nowProgram)
            nowCategory = data['category'][i];
    }
    
    $('#input_message').val(nowCategory['message']);
    $('#input_DM_given').val(nowCategory['dmsale']);
    $('#input_DM_total').val(nowCategory['dmtotal']);
    $('#input_program_sale').val(nowCategory['programsale']);
    $('#input_program_coupon').val(nowCategory['programcoupon']);

    for(var i = 0; i < data['category'].length; i++)
        showCategoryEntry(data['category'][i]);
    for(var i = 0; i < data['manager'].length; i++)
        showMemberEntry(data['manager'][i]);

    if(data['mapattribute'][0]['isshowhidden'])
        $('#input_setting_isshowhidden').attr('checked', true);
    $('#select_setting_currentdata').val(nowProgram);

    $('#requesting').hide();
    $('#attribute').show();
    $('#setting').show();
    $('#manager').show();
}


$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            nowFBID = fbID;
            var dataset = {'id': fbID, 'token': fbToken, 'cmd': 'reqTicket'};
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

            $('#submit_attribute').click(commitAttribute);
            $('#submit_setting').click(commitSetting);
            $('#submit_manager').click(commitManager);
        });
    });
});

