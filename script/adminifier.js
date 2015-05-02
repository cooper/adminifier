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
            var meta = $('content').getElementsByTagName('meta')[0];
            if (meta) {
                var attrs = meta.getProperties('data-nav', 'data-title', 'data-icon');
                handlePageData(attrs);
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
    $('page-title').innerHTML = '<i class="fa fa-' + data['data-icon'] + '"></i> ' + data['data-title'];
}