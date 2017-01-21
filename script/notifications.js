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

    // create login modal window
    loginWindow = new ModalWindow({
        icon:       'user',
        title:      'Login',
        html:       tmpl('tmpl-login-window', {}),
        padded:     true,
        sticky:     true,
        doneText:   null,
        id:         'login-window',
        width:      '400px',
        onDone:     function () {
            loginWindow = undefined;
        }
    });

    // if some error we can't deal with occurs, redirect to real login
    var giveUp = function () {
        window.location = 'logout.php';
    };

    // attempt to login remotely
    var attemptLogin = function () {
        var req = new Request.JSON({
            url: 'functions/login.php',
            secure: true,
            onSuccess: function (data) {
                if (!data.success) {
                    alert('WRONG!'); // FIXME
                    return;
                }
                loginWindow.destroy(true);
            },
            onError: giveUp,
            onFailure: giveUp
        });
        req.post({
            remote:   true,
            username: document.getElement('input[name=username]').get('value'),
            password: document.getElement('input[name=password]').get('value')
        });
    };

    // capture enters and clicks
    loginWindow.content.getElements('input').each(function (input) {
        if (input.get('type') == 'submit')
            input.addEvent('click', attemptLogin);
        else
            input.onEnter(attemptLogin);
    });

    loginWindow.show();
}

})(adminifier);
