document.addEvent('domready', function () {
    setupFrameLinks();
    hashLoad();
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
        onSuccess: function (html) {
            $('content').innerHTML = html;
            var dataScript = $('content').getElementById('metadata');
            if (dataScript) {
                var data = JSON.parse(dataScript.innerText);
                if (data) handlePageData(data);
            }
        }
    });
    request.get();
}

function hashLoad() {
    var hash = window.location.hash;
    if (hash.lastIndexOf('#!/', 0) === 0)
        hash = hash.substring(3);
    else
        return;
    frameLoad(hash);
}

function handlePageData(data) {
    console.log(data);
}