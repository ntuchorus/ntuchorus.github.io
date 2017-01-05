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

