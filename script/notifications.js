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

function displayLoginWindow () {
    if ($('login-window'))
        return;

    // create login modal window
    var loginWindow = new ModalWindow({
        icon:       'user',
        title:      'Login',
        html:       tmpl('tmpl-login-window', {}),
        padded:     true,
        sticky:     true,
        doneText:   null,
        id:         'login-window',
        width:      '400px'
    });

    // if some error we can't deal with occurs, redirect to real login
    var giveUp = function () {
        window.location = 'logout.php';
    };

    // attempt to login remotely
    var inputs = loginWindow.content.getElements('input');
    var attemptLogin = function () {
        inputs.each(function (i) { i.set('disabled', true); });

        var req = new Request.JSON({
            url: 'functions/login.php',
            secure: true,
            onSuccess: function (data) {
                if (!data.success) {
                    alert('WRONG!'); // FIXME
                    inputs.each(function (i) { i.set('disabled', false); });
                    return;
                }
                loginWindow.content.innerHTML = 'Good job'; // FIXME
                setTimeout(function () {
                    loginWindow.destroy(true);
                }, 3000);
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
    inputs.each(function (input) {
        if (input.get('type') == 'submit')
            input.addEvent('click', attemptLogin);
        else
            input.onEnter(attemptLogin);
    });

    loginWindow.show();
}

})(adminifier);
