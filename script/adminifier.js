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

var currentPage;
function frameLoad(page) {
    if (currentPage == page) return;
    currentPage = page;
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
                var attrs = meta.getProperties(
                    
                // SSV = space-separated values
                    
                    
                // Tools for all pages
                    
                'data-nav',         // navigation item identifier to highlight
                'data-title',       // page title for top bar
                'data-icon',        // page icon name for top bar
                'data-scripts',     // SSV script names w/o extensions
                'data-styles',      // SSV css names w/o extensions
                'data-flags',       // SSV page flags
                
                // Used by specific pages
                    
                'data-sort'         // page-list.php
                    
                );
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
    if (hash.lastIndexOf('#!/', 0) === 0) {
        hash = hash.substring(3);
    }
    
    // fall back to dashboard
    else {
        window.location.hash = '#!/dashboard';
        return hashLoad();
    }
    
    frameLoad(hash);
}

var currentFlags = [];
var flagOptions = {
    'no-margin': {
        init: function () {
            $('content').addClass('no-margin');
        },
        destroy: function () {
            $('content').removeClass('no-margin');
        }
    },
    'compact-sidebar': {
        init: function () {
            $('navigation-sidebar').tween('width', '50px');
            $('content').tween('margin-left', '50px');
            $$('#navigation-sidebar li a span').each(function (span) { span.fade('out'); });
            $$('#navigation-sidebar li a').each(function (a) {
                a.addEvents({
                    mouseenter: handleCompactSidebarMouseenter,
                    mouseleave: handleCompactSidebarMouseleave
                });
            });
        },
        destroy: function () {
            $('navigation-sidebar').tween('width', '170px');
            $('content').tween('margin-left', '170px');
            $$('#navigation-sidebar li a span').each(function (span) { span.fade('in'); });
            $$('#navigation-sidebar li a').each(function (a) {
                a.removeEvents({
                    mouseenter: handleCompactSidebarMouseenter,
                    mouseleave: handleCompactSidebarMouseleave
                });
            });
            $$('div.navigation-popover').each(function (p) {
                p.parentElement.eliminate('popover');
                p.parentElement.removeChild(p);
            });
        }
    }
};

function handleCompactSidebarMouseenter (e) {
    var a = e.target;
    var p = a.retrieve('popover');
    if (!p) {
        p = new Element('div', {
            class: 'navigation-popover'
        });
        p.innerHTML = a.getElementsByTagName('span')[0].innerHTML;
        a.appendChild(p);
        p.set('morph', { duration: 150 });
        a.store('popover', p);
    }
    a.setStyle('overflow', 'visible');
    p.setStyle('background-color', '#444');
    p.morph({ 
        width: '90px',
        paddingLeft: '10px'
    });}

function handleCompactSidebarMouseleave (e) {
    var a = e.target;
    var p = a.retrieve('popover');
    if (!p) return;
    p.setStyle('background-color', '#333');
    p.morph({ 
        width: '0px',
        paddingLeft: '0px'
    });
    setTimeout(function () { a.setStyle('overflow', 'hidden'); }, 200);
}

var currentData;
function handlePageData(data) {
    console.log(data);
    currentData = data;
    $('content').setStyle('user-select', 'none');

    // page title and icon
    $('page-title').innerHTML = '<i class="fa fa-' + data['data-icon'] + '"></i> ' + data['data-title'];
    window.scrollTo(0, 0);
    // ^ not sure if scrolling necessary when setting display: none
    
    // highlight navigation item
    var li = $$('li[data-nav="' + data['data-nav'] + '"]')[0];
    if (li) {
        $$('li.active').each(function (li) { li.removeClass('active') });
        li.addClass('active');
    }
    
    // don't show the content until all scripts have loaded
    var scriptsToLoad = 0, scriptsLoaded = -1;
    var scriptLoaded = function () {
        scriptsLoaded++;
        if (scriptsToLoad > scriptsLoaded) return;
        $('content').setStyle('user-select', 'all');
    };
    
    // inject scripts
    $$('script.dynamic').each(function (script) { script.destroy(); });
    var srcs = (data['data-scripts'] || '').split(' ');
    srcs.each(function (src) {
        if (!src.length) return;
        scriptsToLoad++;
        
        if (src == 'ace')
            src = 'ace/ace.js';
        else
            src = 'script/' + src + '.js';
        
        var script = new Element('script', {
            src:   src,
            class: 'dynamic'
        });
        script.addEvent('load', scriptLoaded);
        document.head.appendChild(script);
    });
    scriptLoaded(); // call once in case there are no scripts
 
    // inject styles
    $$('link.dynamic').each(function (link) { link.destroy(); });
    var links = (data['data-styles'] || '').split(' ');
    links.each(function (style) {
        if (!style.length) return;
        var link = new Element('link', {
            href:  'style/' + style + '.css',
            class: 'dynamic',
            type:  'text/css',
            rel:   'stylesheet'
        });
        document.head.appendChild(link);
    });
    
    // handle page flags
    currentFlags.each(function (flag) {
        if (flag.destroy) flag.destroy();
    });
    currentFlags = [];
    var flags = (data['data-flags'] || '').split(' ');
    flags.each(function (flagName) {
        var flag = flagOptions[flagName];
        if (!flag) return;
        currentFlags.push(flag);
        flag.init();
    });
    
}