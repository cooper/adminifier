(function (a) {

document.addEvent('editorLoaded', loadedHandler);
document.addEvent('pageUnloaded', unloadedHandler);

var ae;
function loadedHandler () {
    ae = a.editor;
    if (!ae || !editor) {
        console.log('editorLoaded fired without editor?', a);
        return;
    }
    console.log('Editor tools script loaded');

    // add toolbar functions
    Object.append(ae.toolbarFunctions, {
        options:    displayPageOptionsWindow,
        view:       openPageInNewTab,
        revisions:  displayRevisionViewer
    });

    // disable view button for models
    if (ae.isModel())
        ae.liForAction('view').addClass('disabled');

    // on cursor move, update toolbar hints
    editor.selection.addEventListener('changeCursor', cursorChanged);
    

}

function unloadedHandler () {
    console.log('Unloading editor tools script');
    document.removeEvent('editorLoaded', loadedHandler);
    document.removeEvent('pageUnloaded', unloadedHandler);
    editor.selection.removeEventListener('changeCursor', cursorChanged);
}

function cursorChanged () {
    
}

// PAGE TITLE SELECTOR

function selectPageTitle () {
    var found = ae.findPageVariable(ae.expressions.pageTitle);
    if (!found)
        return;
    editor.selection.setRange(found.range);
}

// VIEW PAGE BUTTON

function openPageInNewTab () {
    if (ae.isModel())
        return;
    var root = a.wikiPageRoot;
    var pageName = ae.getFilename().replace(/\.page$/, '');
    window.open(root + pageName);
}

// REVISION VIEWER

function displayRevisionViewer () {
    
    // make the li stay open until finish()
    var li = ae.liForAction('revisions');
    ae.setLiLoading(li, true);

    // create the box
    var box = ae.createPopupBox(li);
    box.setStyles({ right: 0, bottom: 0 });
    box.addClass('fixed');
    box.innerHTML = tmpl('tmpl-revision-viewer', {});
    var container = box.getElement('#editor-revisions');
    
    // populate and display it
    var finish = function (data) {
        ae.setLiLoading(li, false);
        if (!box)
            return;
        if (!data.success) {
            alert(data.error);
            return;
        }
        if (!data.revs) {
            alert('No revisions');
            return;
        }
        data.revs.each(function (rev) {
            var row = new Element('div', {
                class: 'editor-revision-row',
                'data-commit': rev.id
            });
            row.innerHTML = tmpl('tmpl-revision-row', rev);
            row.addEvent('click', function (e) {
                handleDiffClick(box, row, e);
            });
            container.appendChild(row);
        });
        ae.displayPopupBox(box, 'auto', li);
    };

    // request revision history
    var req = new Request.JSON({
        url: 'functions/page-revisions.php' + (ae.isModel() ? '?model' : ''),
        onSuccess: finish,
        onFailure: function () {
            finish({ error: 'Failed to fetch revision history' });
        },
    }).post({
        page: ae.getFilename()
    });
}

function handleDiffClick (box, row, e) {
    var msg = row.getElement('b').get('text').trim();
    var prevRow = row.getNext();
    
    // display overlay
    var overlay = new Element('div', { class: 'editor-revision-overlay' });
    overlay.appendChild(row.clone().addClass('preview'));
    overlay.innerHTML += tmpl('tmpl-revision-overlay', {});
    box.appendChild(overlay);
    
    // button clicks
    var funcs = [
        
        // view on wiki
        function () {
            alert('Unimplemented');
        },
        
        // view source
        function () {
            alert('Unimplemented');
        },
        
        // diff current
        function () {
            if (!row.getPrevious()) {
                alert('This is the current version');
                return;
            }
            displayDiffViewer(
                box,
                row.get('data-commit'),
                null,
                msg,
                'current'
            );
        },
        
        // diff previous
        function () {
            if (!prevRow) {
                alert('This is the oldest revision');
                return;
            }
            displayDiffViewer(
                box,
                prevRow.get('data-commit'),
                row.get('data-commit'),
                msg,
                'previous'
            );
        },
        
        // revert
        function () {
            alert('Unimplemented');
        },
        
        // restore
        function () {
            alert('Unimplemented');
        },
        
        // back
        function () {
            overlay.setStyle('display', 'none');
            setTimeout(function () { overlay.destroy(); }, 100);
        }
    ];
    overlay.getElements('.editor-revision-diff-button').each(function (but, i) {
        but.addEvent('click', funcs.shift());
    });
}

// DIFF VIEWER

function displayDiffViewer (box, from, to, message, which) {
    box.addClass('sticky');
    var finish = function (data) {
        
        // something wrong happened
        if (!data.success) {
            alert(data.error);
            return;
        }
        
        // no differences
        if (typeof data.diff == 'undefined') {
            alert('No changes');
            return;
        }
        
        // run diff2html
        var diffHTML, diffWindow;
        var runDiff = function (split) {
            diffHTML = Diff2Html.getPrettyHtml(data.diff, {
                outputFormat: split ? 'side-by-side' : 'line-by-line'
            });
            if (diffWindow) diffWindow.content.innerHTML = diffHTML;
        };
        runDiff();
        
        // create a modal window to show the diff in
        diffWindow = new ModalWindow({
            icon:           'clone',
            title:          "Compare '" + message + "' to " + which,
            padded:         true,
            html:           diffHTML,
            width:          '90%',
            doneText:       'Done',
            id:             'editor-diff-window',
            autoDestroy:    true,
            onDone:         function () {
                setTimeout(function () { box.removeClass('sticky'); }, 100);
            },
        });
        
        // switch modes
        var but, split;
        but = diffWindow.addButton('Split view', function () {
            if (split) {
                runDiff(false);
                split = false;
                but.set('text', 'Split view');
                return;
            }
            runDiff(true);
            split = true;
            but.set('text', 'Unified view');
        });
        
        diffWindow.show();
    };

    // request revision history
    var req = new Request.JSON({
        url: 'functions/page-diff.php' + (ae.isModel() ? '?model' : ''),
        onSuccess: finish,
        onFailure: function () {
            finish({ error: 'Failed to fetch page diff' });
        },
    }).post({
        page: ae.getFilename(),
        from: from,
        to: to
    });
}

// PAGE OPTIONS

function displayPageOptionsWindow () {
    if ($('editor-options-window'))
        return;

    // find and store the current values
    var foundOpts = findPageOptions();
    var foundCats = findPageCategories();
    var foundOptsValues = Object.map(foundOpts.found, function (value) {
        return value.value;
    });

    // create the options window
    var optionsWindow = new ModalWindow({
        icon:           'cog',
        title:          ae.isModel() ? 'Model options' : 'Page options',
        html:           tmpl(ae.isModel() ?
            'tmpl-model-options' : 'tmpl-page-options', foundOptsValues),
        padded:         true,
        id:             'editor-options-window',
        autoDestroy:    true,
        onDone:         updatePageOptions
    });

    // update page title as typing
    var titleInput = optionsWindow.content.getElement('input.title');
    titleInput.addEvent('input', function () {
        var title = titleInput.getProperty('value');
        a.updatePageTitle(title.length ? title : ae.getFilename());
    });

    // category list
    if (!ae.isModel()) {

        // get categories from list
        var getCategories = optionsWindow.getCategories = function () {
            var cats = optionsWindow.content.getElements('tr.category');
            return cats.map(function (tr) {
                return tr.retrieve('safeName');
            });
        };

        // add category to liust
        var addCategoryTr = optionsWindow.content.getElement('.add-category');
        var addCategory = function (catName) {

            // category already exists
            var safeName = a.safeName(catName);
            if (getCategories().contains(safeName))
                return;

            // is it a main page?
            var match = catName.match(/(.*)\.main$/), visibleName;
            if (match)
                visibleName = match[1] + ' (main page)';
            else
                visibleName = catName;

            // create the row
            var tr = new Element('tr', {
                class: 'category',
                html:  tmpl('tmpl-page-category', { catName: visibleName })
            });

            // on click, delete the category
            tr.addEvent('click', function () {
                this.destroy();
            });

            tr.store('safeName', safeName);
            tr.inject(addCategoryTr, 'before');
        };

        // on enter of category input, add the category.
        addCategoryTr.getElement('input').onEnter(function () {
            var catName = this.get('value').trim();
            if (!catName.length)
                return;
            addCategory(catName);
            this.set('value', '');
        });

        // add initial categories
        foundCats.found.each(addCategory);
    }

    // store state in the options window
    optionsWindow.foundOptsValues = foundOptsValues;
    optionsWindow.foundOpts = foundOpts;
    optionsWindow.foundCats = foundCats;

    // show it
    optionsWindow.show();
}

function updatePageOptions () {

    // replace old option values with new ones
    var container = this.container;
    var newOpts = Object.merge({},
        this.foundOptsValues,
        Object.filter(Object.map({
            title:      [ 'input.title',    'value'     ],
            author:     [ 'input.author',   'value'     ],
            draft:      [ 'input.draft',    'checked'   ]
        }, function (value) {
            var el = container.getElement(value[0]);
            if (!el) return;
            return el.get(value[1]);
        }), function (value) {
            return typeof value != 'undefined';
        })
    );

    // get new categories
    var newCats = this.getCategories ? this.getCategories() : [];

    var removeRanges = [this.foundOpts.ranges, this.foundCats.ranges].flatten();
    ae.removeLinesInRanges(removeRanges);
    insertPageOptions(newOpts, newCats);
}

function insertPageOptions (newOpts, newCats) {

    // this will actually be passed user input
    var optsString = generatePageOptions(newOpts);

    // inject the new lines at the beginning
    var pos = { row: 0, column: 0 };
    pos = editor.session.insert(pos, optsString);

    // after inserting, the selection will be the line following
    // the insertion at column 0.

    // now check for categories
    if (newCats.length) {
        pos = editor.session.insert(pos, '\n');
        newCats.sort().each(function (catName) {
            pos = editor.session.insert(
                pos,
                '@category.' + catName + ';\n'
            );
        });
    }

    // above this point, the selection has not been affected

    // set the current selection to the insert position
    var oldRange = editor.selection.getRange();
    editor.selection.setRange(new Range(
        pos.row, 0,
        pos.row, 0
    ));

    // remove extra newlines at the new position; set the selection to where
    // it was originally by shifting up by number of lines removed
    var removed = ae.removeExtraNewlines();
    editor.selection.setRange(new Range(
        oldRange.start.row - removed, oldRange.start.column,
        oldRange.end.row   - removed, oldRange.end.column
    ));
}

function pageVariableFromRange (range, exp, bool) {
    var text  = editor.session.getTextRange(range);
    var match = ae.findPageVariable(exp, range);
    if (!match)
        return;
    return {
        name:   match.name,
        text:   match.text,
        value:  bool ? true : match.text.trim(),
        range:  match.range
    };
};

function findVariables (found, exp, bool) {
    var search = new Search().set({ needle: exp, regExp: true });

    // find each thing
    var ranges = search.findAll(editor.session);
    ranges.each(function (i) {
        var res = pageVariableFromRange(i, exp, bool);
        if (res) found[res.name] = res;
    });

    return ranges;
}

function findPageOptions () {
    var found = {}, ranges = [];
    ranges.combine(findVariables(found, ae.expressions.keyValueVar));
    ranges.combine(findVariables(found, ae.expressions.boolVar, true));
    return {
        found:  found,
        ranges: ranges
    };
}

function findPageCategories () {
    var found = {}, ranges = [];
    ranges.combine(findVariables(found, ae.expressions.category, true));
    return {
        found:  Object.keys(found),
        ranges: ranges
    };
}

function generatePageOptions (opts) {
    var string  = '',
        biggest = 9,
        done    = {};
    var updateBiggest = function (length, ret) {
        var maybeBigger = length + 5;
        if (maybeBigger > biggest)
            biggest = maybeBigger;
        return ret;
    };

    // these three always go at the top, in this order
    ['title', 'author', 'created'].append(
        Object.keys(opts).sort(function (a, b) {
        var aBool = opts[a] === true,
            bBool = opts[b] === true;

        // both bool, fallback to alphabetical
        if (aBool && bBool)
            return a.localeCompare(b);

        // one bool, it comes last
        if (bBool && !aBool)
            return updateBiggest(a.length, -1);
        if (aBool && !bBool)
            return updateBiggest(b.length, 1);

        // neither bool, fallback to alphabetical
        updateBiggest(Math.max(a.length, b.length));
        return a.localeCompare(b);

    })).each(function (optName) {
        if (done[optName])
            return;
        done[optName] = true;

        // not present
        var value = opts[optName];
        if (typeOf(value) == 'null')
            return;
        if (typeOf(value) == 'string' && !value.length)
            return;
        if (typeOf(value) == 'boolean' && !value)
            return;

        string += '@page.' + optName;

        // non-boolean value
        if (value !== true) {
            string += ':';

            // add however many spaces to make it line up
            if (optName.length < biggest)
                string += Array(biggest - optName.length).join(' ');

            // escape semicolons
            value = value.replace(/;/g, '\\;');

            string += value;
        }

        string += ';\n';
    });
    return string;
}

})(adminifier);
