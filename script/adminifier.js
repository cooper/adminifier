window.addEvent('hashchange', hashLoad);
document.addEvent('domready', function () {
    setupFrameLinks(document.body);
    hashLoad();
});

function setupFrameLinks(parent) {
    parent.getElements('a.frame-click').each(function (a) {
        a.addEventListener('click', function (e) {
            frameLoad(a.getProperty('href').substring(3));
        });
    });
}

function frameLoad(page) {
    console.log("Loading "+page);
    
    // add .php extension, respecting GET arguments
    var parts = page.split('?', 2);
    page = parts[0] + '.php';
    if (typeof parts[1] != 'undefined')
        page += '?' + parts[1];
    
    var request = new Request({
        url: 'frames/' + page,
        onSuccess: function (html) {
            $('content').innerHTML = html;
            var meta = $('content').getElementsByTagName('meta')[0];
            if (meta) {
                var attrs = meta.getProperties('data-nav', 'data-title', 'data-icon');
                handlePageData(attrs);
            }
            setupFrameLinks($('content'));
        },
        onFail: function (html) {
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
    
    // page title and icon
    $('content').setStyle('opacity', 0);
    $('page-title').innerHTML = '<i class="fa fa-' + data['data-icon'] + '"></i> ' + data['data-title'];
    window.scrollTo(0, 0);
    $('content').setStyle('opacity', 1);
    
    // highlight navigation item
    var li = $$('li[data-nav="' + data['data-nav'] + '"]')[0];
    if (li) {
        $$('li.active').each(function (li) { li.removeClass('active') });
        li.addClass('active');
    }
    
}