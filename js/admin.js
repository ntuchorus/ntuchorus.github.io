var ticketTable = {};
var editTicketTable = {};

function fbsdkInitialization(callback) {
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id))
            return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '182021738937273',
            cookie     : true,
            xfbml      : true,
            version    : 'v2.8'
        });
        callback();
    };
}

function fbsdkCheckLogin(callback) {
    FB.getLoginStatus(function(response) {
        if(response.status !== 'connected') {
            FB.login(function(res){
                if(res.status === 'connected')
                    callback(res.authResponse.userID, res.authResponse.accessToken);
                else
                    $('#requesting').html('請使用Facebook登入');
            });
        }
        else {
            callback(response.authResponse.userID, response.authResponse.accessToken);
        }
    });
}

function updateSeat(id) {
    var finalState = ticketTable[id]['state'];
    var finalType = ticketTable[id]['type'];
    var finalPreserve = ticketTable[id]['preserve'];
    
    $('#' + id).attr('class', 'seat');
    if(finalPreserve > 0)
        $('#' + id).addClass('seat_type_6');
    else{
        if(id in editTicketTable)
            $('#' + id).addClass('seat_select');
        else{
            if(finalState == 2)
                $('#' + id).addClass('seat_type_5');
            else if(finalState == 1)
                $('#' + id).addClass('seat_type_4');
            else
                $('#' + id).addClass('seat_type_' + finalType);
        }
    }
}

function select(a) {
    var click_id = a.attr('id');
    if(ticketTable[click_id]['type'] < 4 && ticketTable[click_id]['preserve'] == 0){
        if(click_id in editTicketTable)
            delete editTicketTable[click_id];
        else
            editTicketTable[click_id] = 1;
        updateSeat(click_id);
    }
}

function commitData(mode){
    var dataset = [];
    for(var id in editTicketTable){
        dataset.push(ticketTable[id]['id']);
    }
    fbsdkCheckLogin(function(fbID, fbToken){
        var commit = {'id': fbID, 'token': fbToken, 'cmd': 'drawTicket', 'data': dataset, 'mode': mode};
        connectServer('POST',
                      JSON.stringify(commit),
                      'edit',
                      function(data){
            if(data["status"] == "0"){
                window.location.reload();
            }
            else{
                alert('寫入失敗，請稍候再試或聯絡管理員');
            }
        });
    });
    return false;
}

$(document).ready(function(){
    fbsdkInitialization(function(){
        fbsdkCheckLogin(function(fbID, fbToken){
            var dataset = {'id': fbID, 'token': fbToken};
            connectServer('POST',
                          JSON.stringify(dataset),
                          'request',
                          function(data){
                              alert(JSON.stringify(data));
                if(data[0]["status"] == "0"){
                    $('#update_date').html('更新時間：' + data[1]['time'] + '　　　瀏覽次數：' + data[1]['counter']);
                    $('#update_message').html(data[1]['message']);
                    $('#requesting').hide();
                    for(var i = 2; i < data.length; i++){
                        var seat_id = 'seat_' + data[i]['floor'] + '_' + data[i]['row'] + '_' + data[i]['seat'];
                        var seat_state = parseInt(data[i]['state']);
                        var seat_type = parseInt(data[i]['type']);
                        var seat_preserve = parseInt(data[i]['preserve']);
                        var arr = {};
                        arr['id'] = parseInt(data[i]['id']);
                        arr['state'] = parseInt(data[i]['state']);
                        arr['type'] = parseInt(data[i]['type']);
                        arr['preserve'] = parseInt(data[i]['preserve']);
                        ticketTable[seat_id] = arr;
                        if(seat_preserve > 0)
                            $(seat_id).addClass('seat_type_6');
                        else if(seat_state == 2)
                            $(seat_id).addClass('seat_type_5');
                        else if(seat_state == 1)
                            $(seat_id).addClass('seat_type_4');
                        else{
                            if(seat_type >= 4)
                                $(seat_id).addClass('seat_type_6');
                            else
                                $(seat_id).addClass('seat_type_' + seat_type);
                        }
                        updateSeat(seat_id);
                    }
                    $('#message').show();
                    $('#floor_4').show();
                    $('#floor_3').show();
                    $('#floor_2').show();
                    $('#form').show();
                }
                else if(data[0]["status"] == '1'){
                    $('#requesting').html('目前非購票時段');
                }
                else if(data[0]["status"] == '2'){
                    $('#requesting').html('權限不足');
                }
                else{
                    $('#requesting').html('讀取失敗，請稍候再試或聯絡管理員');
                }
            });

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
});

