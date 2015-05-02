document.addEvent('domready', function () {
    setupFrameLinks();
});

function setupFrameLinks() {
    $$('a.frame-click').each(function (a) {
        a.addEventListener('click', function (e) {
            frameLoad(a.getProperty('href').substring(3));
        });
    });
}

function frameLoad(page) {
    console.log("Loading "+page);
    var request = new Request({
        url: 'frames/' + page + '.php',
        onSuccess: function (data) {
            $('content').innerHTML = data;
        }
    });
    request.get();
}