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

var NotificationPopup = window.NotificationPopup = new Class({

    Implements: [Options, Events],

    options: {
        autoDestroy:    false,
        sticky:         false
    },

    initialize: function (opts) {
        this.popup = new Element('div', { id: 'notification-popup' });
        this.setOptions(opts);
    },

    setOptions: function (opts) {
        Options.prototype.setOptions.call(this, opts);
        opts = this.options;
        this.popup.innerHTML = tmpl('tmpl-notification', opts);
    },

    show: function (container) {
        if (!container)
            container = document.body;
        container.adopt(this.popup);
        this.popup.setStyle('display', 'block');
        this.shown = true;
    },

    hide: function (isDestroy) {
        if (!this.shown || this.options.sticky)
            return;
        delete this.shown;
        this.fireEvent('done');
        this.popup.setStyle('display', 'none');
        if (this.options.autoDestroy && !isDestroy)
            this._destroy();
    },

    destroy: function (force) {
        if (this.options.sticky && !force)
            return;
        delete this.options.sticky;
        this.hide(true);
        this._destroy();
    },

    _destroy: function () {
        this.popup.destroy();
    }
});

})(adminifier);
