(function (a) {

document.addEvent('editorLoaded', loadedHandler);
document.addEvent('pageUnloaded', unloadedHandler);

var ae;
function loadedHandler () {
    ae = a.editor;
    if (!ae) {
        console.log('editorLoaded fired without editor?', a);
        return;
    }
    console.log('Editor tools script loaded');

    // add toolbar functions
    Object.append(ae.toolbarFunctions, {
        font:       displayFontSelector,
        link:       displayLinkHelper,
        options:    displayPageOptionsWindow,
        view:       openPageInNewTab,
        delete:     displayDeleteConfirmation,
        save:       displaySaveHelper,
        revisions:  displayRevisionViewer
    });

    // add keyboard shortcuts
    ae.addKeyboardShortcuts([
        [ 'Ctrl-B', 'Command-B',    'bold'      ],
        [ 'Ctrl-I', 'Command-I',    'italic'    ],
        [ 'Ctrl-U', 'Command-U',    'underline' ],
        [ 'Ctrl-S', 'Command-S',    'save'      ],
        [ 'Ctrl-K', 'Command-K',    'link'      ]
    ]);

    // disable view button for models
    if (ae.isModel())
        liForAction('view').addClass('disabled');

    // start the autosave timer
    resetAutosaveInterval();
}

function unloadedHandler () {
    console.log('Unloading editor tools script');
    document.removeEvent('editorLoaded', loadedHandler);
    document.removeEvent('pageUnloaded', unloadedHandler);
    clearAutosaveInterval();
}

function fakeAdopt (child) {
    var parent = $('fake-parent');
    if (!parent) {
        parent = new Element('div', {
            id: 'fake-parent',
            styles: { display: 'none' }
        });
        document.body.appendChild(parent);
    }
    parent.appendChild(child);
}

// PAGE TITLE SELECTOR

function selectPageTitle () {
    var found = ae.findPageVariable(ae.expressions.pageTitle);
    if (!found)
        return;
    editor.selection.setRange(found.range);
}

// TEXT COLOR SELECTOR

function displayFontSelector () {
    
    // create box
    var li  = liForAction('font');
    var box = ae.createPopupBox(li);
    box.innerHTML = tmpl('tmpl-color-helper', {});
    
    // create color picker
    var cp = new DynamicColorPicker({
        parent: box.getElement('editor-color-hex')
    });
    setTimeout(function () { cp.show(); }, 100);
    
    // create crayon picker.
    var container = box.getElement('#editor-color-names');

    // temporarily add it to the body
    // for when we call getComputedStyle
    fakeAdopt(container);

    // create color elements
    colorList.each(function (colorName) {
        var div = new Element('div', {
            styles: { backgroundColor: colorName },
            class: 'editor-color-cell'
        });

        // separate the name into words
        div.innerHTML = tmpl('tmpl-color-name', {
            colorName: colorName.replace(/([A-Z])/g, ' $1')
        });
        container.appendChild(div);

        // compute and set the appropriate text color
        var color = new Color(getComputedStyle(div, null).getPropertyValue('background-color'));
        div.setStyle('color', getContrastYIQ(color.hex.substr(1)));

        // add click event
        div.addEvent('click', ae.wrapTextFunction(colorName));

    });

    // put it where it belongs
    container.parentElement.removeChild(container);
    container.setStyle('display', 'block');
    box.appendChild(container);

    ae.displayPopupBox(box, 200, li);
}

function getContrastYIQ (hexColor) {
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000' : '#fff';
}

// LINK HELPER

function displayLinkHelper () {
    var li  = liForAction('link');
    var box = ae.createPopupBox(li);
    fakeAdopt(box);

    box.innerHTML = tmpl('tmpl-link-helper', {});

    // first input, second input, button title, left delimiter, right delimiter
    $('editor-link-type-internal').store('linkInfo', [
        'Display text', 'Page target', 'Insert page link',
        'My Page',
        '[', ']'
    ]);
    $('editor-link-type-external').store('linkInfo', [
        'Display text', 'External page target', 'Insert external page link',
        'Some Page',
        '!', '!'
    ]);
    $('editor-link-type-category').store('linkInfo', [
        'Display text', 'Category target', 'Insert category link',
        'News',
        '~', '~'
    ]);
    $('editor-link-type-url').store('linkInfo', [
        'Display text', 'URL target', 'Insert URL',
        'http://www.example.com',
        '$', '$'
    ]);

    // switch between link types
    var activeType = $('editor-link-type-internal');
    $$('.editor-link-type').each(function (type) {
        type.addEvent('click', function () {

            // set the active type
            if (type.hasClass('active')) return;
            activeType.removeClass('active');
            type.addClass('active');
            activeType = type;

            // update the text
            var info = type.retrieve('linkInfo');
            $('editor-link-title1').innerHTML = info[1];
            $('editor-link-title2').innerHTML = info[0];
            $('editor-link-insert').innerHTML = info[2];
            $('editor-link-target').setProperty('placeholder', info[3]);

        });
    });

    // selected text = display text
    // choose a word if there is no actual selection
    var r = ae.getSelectionRanges();
    editor.selection.setRange(r.select);
    var selected = editor.session.getTextRange(r.select);

    if (selected.trim().length) {
        $('editor-link-display').setProperty('value', selected);
        $('editor-link-target').setProperty('value', selected);
    }

    // insert link function
    var insertLink = function () {
        var displayText = $('editor-link-display').getProperty('value'),
            targetText  = $('editor-link-target').getProperty('value'),
            leftDel     = activeType.retrieve('linkInfo')[4],
            rightDel    = activeType.retrieve('linkInfo')[5];

        // make sure requirements were met
        if (!displayText.length || !targetText.length) {
            alert('Please specify display text and target');
            return;
        }

        // one or two parts, depending on if display == target
        var inner = displayText;
        if (displayText.toLowerCase() != targetText.toLowerCase())
            inner += ' | ' + targetText;

        var complete = '[' + leftDel + ' ' + inner + ' ' + rightDel + ']';
        editor.insert(complete);
        ae.closePopup(box);
    };

    // insert on click or enter
    $('editor-link-insert').addEvent('click', insertLink);
    $('editor-link-target').onEnter(insertLink);
    $('editor-link-display').onEnter(insertLink);

    ae.displayPopupBox(box, 215, li);
    $('editor-link-target').focus();
}

// VIEW PAGE BUTTON

function openPageInNewTab () {
    if (ae.isModel())
        return;
    var root = a.wikiPageRoot;
    var pageName = ae.getFilename().replace(/\.page$/, '');
    window.open(root + pageName);
}

// SAVE COMMIT HELPER

function displaySaveHelper () {
    return _saveHelper(false);
}

function _saveHelper () {
    var li  = liForAction('save');
    var box = ae.createPopupBox(li);
    fakeAdopt(box);

    box.innerHTML = tmpl('tmpl-save-helper', {
        file: ae.getFilename()
    });

    var closeBoxSoon = function () {
        setTimeout(function () {

            // make the box no longer sticky, so that when the user
            // clicks away, it will disappear now
            box.removeClass('sticky');

            // close the popup only if the mouse isn't over it
            ae.closePopup(box, {
                unlessActive: true,
                afterHide: function () {
                    li.getElement('span').set('text', 'Save');
                }
            });

        }, 3000);
    };

    // save changes function
    var saveChanges = function () {

        // already saving
        var message = $('editor-save-message');
        if (!message)
            return;

        var saveData = editor.getValue();

        // prevent box from closing for now
        box.addClass('sticky');
        var message = message.getProperty('value');

        // "saving..."
        $('editor-save-wrapper').innerHTML = tmpl('tmpl-save-spinner', {});
        var btn = $('editor-save-commit');
        btn.innerHTML = 'Comitting changes';
        btn.addClass('progress');

        // save failed callback
        var fail = function (msg) {
            alert('Save failed: ' + msg);

            // switch to /!\
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-exclamation-triangle');

            // update button
            btn.addClass('failure');
            btn.removeClass('progress');
            btn.innerHTML = 'Save failed';

            closeBoxSoon();
        };

        // successful save callback
        var success = function (data) {
            console.log(data);
            ae.lastSavedData = saveData;

            // something went wrong in the page display
            var displayBad = false, res = data.result;
            if (!res || res.type == 'not found' && !res.draft)
                displayBad = true;

            // switch to checkmark
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-check-circle');

            // update button
            btn.removeClass('progress');
            btn.addClass(displayBad ? 'warning' : 'success');
            var text = data.unchanged ?
                'File unchanged' : 'Saved ' + data.rev_latest.id.substr(0, 7);
            if (displayBad)
                text += ' with errors';
            btn.innerHTML = text;

            // show the page display error
            ae.handlePageDisplayResult(res);

            closeBoxSoon();
        };

        // save request
        saveRequest(saveData, message, success, fail);
    };

    // display it
    if (!ae.displayPopupBox(box, 120, li))
        return;

    // on click or enter, save changes
    $('editor-save-commit').addEvent('click', saveChanges);
    $('editor-save-message').onEnter(saveChanges);
    $('editor-save-message').focus();
}

function autosave () {
    if (ae.currentPopup) return; // FIXME
    
    // make it apparent that autosave is occurring
    var li = liForAction('save');
    ae.setLiLoading(li, true, true);
    li.getElement('span').set('text', 'Autosave');
    
    // on fail or success, close the li
    var done = function () {
        setTimeout(function () {
            ae.setLiLoading(li, false, true);
        }, 2000);
        setTimeout(function () {
            li.getElement('span').set('text', 'Save');
        }, 2500);
    };
    
    // attempt to save
    var saveData = editor.getValue();
    saveRequest(saveData, 'Autosave', function (data) { // success
        done();
        ae.lastSavedData = saveData;
        ae.handlePageDisplayResult(data.result);
    }, function (msg) { // failure
        done();
        alert('Save failed: ' + msg);
    });
}

function saveRequest (saveData, message, success, fail) {

    // do the request
    new Request.JSON({
        url: 'functions/write-page.php' + (ae.isModel() ? '?model' : ''),
        secure: true,
        onSuccess: function (data) {

            // updated without error
            if (data.success)
                success(data);

            // revision error

            // nothing changed
            else if (data.rev_error && data.rev_error.match('no changes')) {
                data.unchanged = true;
                success(data);
            }

            // git error
            else if (data.rev_error)
                fail(data.rev_error);

            // other error
            else if (data.reason)
                fail(data.reason);

            // not sure
            else
                fail("Unknown error");
        },
        onError: function () {
            fail('Bad JSON reply');
        },
        onFailure: function (data) {
            fail('Request error');
        },
    }).post({
        page:       ae.getFilename(),
        content:    saveData,
        message:    message
    });

    // reset the autosave timer
    resetAutosaveInterval();
}

var autosaveInterval;
function resetAutosaveInterval () {
    clearAutosaveInterval();
    if (a.autosave) {
        autosaveInterval = setInterval(autosave, a.autosave);
    }
}

function clearAutosaveInterval () {
    if (autosaveInterval != null)
        clearInterval(autosaveInterval);
}

// REVISION VIEWER

function displayRevisionViewer () {
    
    // make the li stay open until finish()
    var li = liForAction('revisions');
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
        
        // revert this commit
        diffWindow.addButton('Revert', function () { alert('Unimplemented'); });
        
        // switch modes
        var but, split;
        but = diffWindow.addButton('Split', function () {
            if (split) {
                runDiff(false);
                split = false;
                but.set('text', 'Split');
                return;
            }
            runDiff(true);
            split = true;
            but.set('text', 'Unified');
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

// DELETE CONFIRMATION

function displayDeleteConfirmation () {
    var li  = liForAction('delete');
    var box = ae.createPopupBox(li);
    fakeAdopt(box);

    box.innerHTML = tmpl('tmpl-delete-confirm', {});

    // button text events
    var btn = $('editor-delete-button');
    var shouldChange = function () {
        return !btn.hasClass('progress') &&
               !btn.hasClass('success')  &&
               !btn.hasClass('failure');
    };
    btn.addEvent('mouseenter', function () {
        if (shouldChange()) btn.innerHTML = 'Delete this page';
    });
    btn.addEvent('mouseleave', function () {
        if (shouldChange()) btn.innerHTML = 'Are you sure?';
    });

    // delete page function
    var deletePage = function () {

        // prevent box from closing for now
        box.addClass('sticky');

        // "deleting..."
        $('editor-delete-wrapper').innerHTML = tmpl('tmpl-save-spinner', {});
        btn.innerHTML = 'Deleting page';
        btn.addClass('progress');

        // success callback
        var success = function () {

            // switch to checkmark
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-check-circle');

            // update button
            btn.addClass('success');
            btn.removeClass('progress');
            btn.innerHTML = 'File deleted';

            // redirect
            setTimeout(function () {
                window.location = a.adminRoot
            }, 3000);
        };

        var fail = function () {

            // switch to /!\
            var i = btn.parentElement.getElement('i');
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-exclamation-triangle');

            // update button
            btn.addClass('failure');
            btn.removeClass('progress');
            btn.innerHTML = 'Delete failed';

            setTimeout(function () {
                ae.closePopup(box);
            }, 1500);
        };

        // delete request
        var req = new Request.JSON({
            url: 'functions/delete-page.php' + (ae.isModel() ? '?model' : ''),
            onSuccess: function (data) {

                // deleted without error
                if (data.success)
                    success();

                // delete error
                else
                    fail('Unknown error');
            },
            onFailure: function () { fail('Request error') },
        }).post({
            page: ae.getFilename()
        });

    };

    // on click, delete page
    btn.addEvent('click', deletePage);

    ae.displayPopupBox(box, 120, li);
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

function liForAction (action) {
    return document.getElement('li[data-action="' + action + '"]');
}

})(adminifier);
