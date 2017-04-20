(function (a) {

var pageScriptsDone = false;

// this is for if pageScriptsDone event is added
// and the page scripts are already done
Element.Events.pageScriptsLoaded = {
	onAdd: function (fn) {
		if (pageScriptsDone)
            fn.call(this);
	}
};

Element.implement('onEnter', function (func) {
    this.addEvent('keyup', function (e) {
        if (e.key != 'enter')
            return;
        func.call(this, e);
    });
});

// update page title
a.updatePageTitle = function (title, titleTagOnly) {
    if (!titleTagOnly)
        $('page-title').getElement('span').innerText = title;
    document.title = title + ' | ' + a.wikiName;
};

// safe page/category name
a.safeName = function (name) {
    return name.replace(/[^\w\.\-]/g, '_');
}

window.addEvent('hashchange', hashLoad);
document.addEvent('domready', hashLoad);
document.addEvent('domready', searchHandler)
document.addEvent('keyup', handleEscapeKey);

function frameLoad (page) {
    if (a.currentPage == page)
        return;
    document.fireEvent('pageUnloaded');
    a.currentPage = page;
    console.log("Loading " + page);

    // add .php extension, respecting GET arguments
    var idx = page.indexOf('?');
    if (idx == -1)
        idx = page.length;
    page = page.slice(0, idx) + '.php' + page.slice(idx);

    var request = new Request({
        url: 'frames/' + page,
        onSuccess: function (html) {

            // the page may start with JSON metadata...
            if (!html.indexOf('<!--JSON')) {
                var json = JSON.parse(html.split('\n', 3)[1]);
                a.currentJSONMetadata = json;
            }

            // set the content
            $('content').innerHTML = html;

            // find HTML metadata
            var meta = $('content').getElement('meta');
            if (meta) {
                var attrs = meta.getProperties(

                // SSV = space-separated values

                // Tools for all pages
                'data-redirect',    // javascript frame redirect
                'data-wredirect',   // window redirect
                'data-nav',         // navigation item identifier to highlight
                'data-title',       // page title for top bar
                'data-icon',        // page icon name for top bar
                'data-scripts',     // SSV script names w/o extensions
                'data-styles',      // SSV css names w/o extensions
                'data-flags',       // SSV page flags
				'data-search', 		// name of function to call on search

                // Used by specific pages

                'data-sort'         // page-list.php

                );
                handlePageData(attrs);
            }
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
            $$('#navigation-sidebar li a').each(function (a) {
                a.getElement('span').fade('out');
                a.addEvents({
                    mouseenter: handleCompactSidebarMouseenter,
                    mouseleave: handleCompactSidebarMouseleave
                });
            });
        },
        destroy: function () {
            $('navigation-sidebar').tween('width', '170px');
            $('content').tween('margin-left', '170px');
            $$('#navigation-sidebar li a').each(function (a) {
                a.getElement('span').fade('in');
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
    },
	'search': {
		init: function() {
			$('top-search').setStyle('display', 'inline-block');
			searchUpdate();
		},
		destroy: function () {
			$('top-search').setStyle('display', 'none');
		}
	}
};

function handleCompactSidebarMouseenter (e) {
    var a = e.target;
    var p = a.retrieve('popover');
    if (!p) {
        p = new Element('div', { class: 'navigation-popover' });
        p.innerHTML = a.getElement('span').innerHTML;
        a.appendChild(p);
        p.set('morph', { duration: 150 });
        a.store('popover', p);
    }
    a.setStyle('overflow', 'visible');
    p.setStyle('background-color', '#444');
    p.morph({
        width: '90px',
        paddingLeft: '10px'
    });
}

function handleCompactSidebarMouseleave (e) {
    var a = e.target;
    var p = a.retrieve('popover');
    if (!p) return;
    p.setStyle('background-color', '#333');
    p.morph({
        width: '0px',
        paddingLeft: '0px'
    });
    setTimeout(function () {
        a.setStyle('overflow', 'hidden');
    }, 200);
}

// escape key pressed
function handleEscapeKey (e) {
    if (e.key != 'esc')
        return;
    var container = document.getElement('.modal-container');
    if (container)
        container.retrieve('modal').destroy();
}

function handlePageData (data) {
    pageScriptsDone = false;

    console.log(data);
    a.currentData = data;
    $('content').setStyle('user-select', 'none');

    // window redirect
    var target = data['data-wredirect'];
    if (target) {
        console.log('Redirecting to ' + target);
        window.location = target;
        return;
    }

    // page redirect
    target = data['data-redirect'];
    if (target) {
        var newHash = '#!/' + target;
        console.log('Redirecting to ' + newHash);
        window.location.hash = newHash;
        return;
    }

    // page title and icon
    $('page-title').innerHTML = tmpl('tmpl-page-title', data);
    a.updatePageTitle(data['data-title'], true);
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
        pageScriptsDone = true;
        document.fireEvent('pageScriptsLoaded');
    };

    // inject scripts
    $$('script.dynamic').each(function (script) { script.destroy(); });
    SSV(data['data-scripts']).each(function (src) {
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
    SSV(data['data-styles']).each(function (style) {
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
    if (a.currentFlags)
        a.currentFlags.each(function (flag) {
            if (flag.destroy)
                flag.destroy();
        });
    a.currentFlags = [];
    SSV(data['data-flags']).each(function (flagName) {
        var flag = flagOptions[flagName];
        if (!flag) return;
        a.currentFlags.push(flag);
        flag.init();
    });
}

function SSV (str) {
    if (typeof str != 'string' || !str.length)
        return [];
    return str.split(' ');
}

function searchHandler () {
	$('top-search').addEvent('keyup', searchUpdate);
}

function searchUpdate () {
	var text = $('top-search').get('value');
	if (!a.currentData || !a.currentData['data-search'])
		return;
	window[a.currentData['data-search']](text);
}

})(adminifier);
