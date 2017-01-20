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

}

})(adminifier);
