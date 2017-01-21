(function (a) {

setInterval(pingServer, 60000);
pingServer();

function pingServer () {
    var req = new Request.JSON({
        url: 'functions/events.php',
        secure: true,
        onSuccess: function (data) {
            if (!data.connected)
                displayLoginWindow();
        },
        onError: displayLoginWindow,
        onFailure: displayLoginWindow
    });
    req.get();
}

var loginWindow;
function displayLoginWindow () {
    if (loginWindow)
        return;
    loginWindow = new ModalWindow({
        icon:       'user',
        title:      'Login',
        html:       tmpl('tmpl-login-window', {}),
        padded:     true,
        sticky:     true,
        doneText:   null,
        onDone:     function () {
            console.log('calling login.php');
            loginWindow = undefined;
        }
    });
    loginWindow.show();
}

})(adminifier);
