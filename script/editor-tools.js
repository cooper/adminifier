(function (a, ae) {

document.addEvent('editorLoaded', loadedHandler);
document.addEvent('pageUnloaded', unloadedHandler);

var ae;
function loadedHandler () {
    ae = adminifier.editor;
    ae.findPageCategories = findPageCategories;
    console.log('Editor tools script loaded');
    Object.append(ae.toolbarFunctions, {
        font:       displayFontSelector,
        link:       displayLinkHelper,
        options:    displayPageOptionsWindow,
        view:       openPageInNewTab,
        delete:     displayDeleteConfirmation,
        save:       displaySaveHelper
    });

    ae.addKeyboardShortcuts([
        [ 'Ctrl-B', 'Command-B',    'bold'      ],
        [ 'Ctrl-I', 'Command-I',    'italic'    ],
        [ 'Ctrl-U', 'Command-U',    'underline' ],
        [ 'Ctrl-S', 'Command-S',    'save'      ],
        [ 'Ctrl-K', 'Command-K',    'link'      ]
    ]);
}

function unloadedHandler () {
    console.log('Unloading editor tools script');
    document.removeEvent('editorLoaded', loadedHandler);
    document.removeEvent('pageUnloaded', unloadedHandler);
}

function fakeAdopt (child) {
    if (!$('fake-parent')) {
        var parent = new Element('div', {
            id: 'fake-parent',
            styles: { display: 'none' }
        });
        document.body.appendChild(parent);
    }
    $('fake-parent').appendChild(child);
}

// PAGE TITLE SELECTOR

function selectPageTitle () {
    var found = ae.findPageVariable(ae.expressions.pageTitle);
    if (!found)
        return;
    editor.selection.setSelectionRange(found.range);
}

// TEXT COLOR SELECTOR

function displayFontSelector () {
    var li   = $$('li[data-action="font"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = ae.createPopupBox(rect.left, rect.top + li.offsetHeight);

    // create a container for scrolling
    var container = new Element('div', {
        styles: {
            overflowY: 'auto',
            height: '100%',
            display: 'none'
        }
    });

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
    var li   = $$('li[data-action="link"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = ae.createPopupBox(rect.left, rect.top + li.offsetHeight);
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
    editor.selection.setSelectionRange(r.select);
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
    var root = a.wikiPageRoot;
    var pageName = ae.getFilename().replace(/\.page$/, '');
    window.open(root + pageName);
}

// SAVE COMMIT HELPER

function displaySaveHelper () {
    var li   = $$('li[data-action="save"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = ae.createPopupBox(rect.right - 300, rect.top + li.offsetHeight);
    box.addClass('right');
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
            ae.closePopup(box, { unlessActive: true });

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
            if (!res || (res.type != 'page' && !res.draft))
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
                'File unchanged' : 'Saved ' + data.rev_info.id.substr(0, 7);
            if (displayBad)
                text += ' with errors';
            btn.innerHTML = text;

            // show the page display error
            ae.handlePageDisplayResult(res);

            closeBoxSoon();
        };

        // save request
        var req = new Request.JSON({
            url: 'functions/write-page.php',
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
                else if (data.error)
                    fail(data.error);

                // not sure
                else
                    fail("Unknown error");
            },
            onError: function () {
                fail('Bad JSON reply');
            },
            onFailure: function (data) {
                console.log("on failure");
                console.log(data);
                fail('Request error');
            },
        }).post({
            page:       ae.getFilename(),
            content:    saveData,
            message:    message
        });

    };

    // on click or enter, save changes
    $('editor-save-commit').addEvent('click', saveChanges);
    $('editor-save-message').onEnter(saveChanges);

    ae.displayPopupBox(box, 120, li);
    $('editor-save-message').focus();
}

// DELETE CONFIRMATION

function displayDeleteConfirmation () {
    var li   = $$('li[data-action="delete"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = ae.createPopupBox(rect.right - 300, rect.top + li.offsetHeight);
    box.addClass('right');
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
            btn.innerHTML = 'File Deleted';

            // redirect
            setTimeout(function () {
                window.location = a.adminRoot
            }, 1500);

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
            url: 'functions/delete-page.php',
            onSuccess: function (data) {

                // deleted without error
                if (data.success)
                    success();

                // delete error
                else fail('Unknown error');

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
    var found = findPageOptions(true);

    // this will actually be passed user input
    var optsString = generatePageOptions(Object.map(found, function (value, key) {
        return value.value;
    }));

    // inject the new lines at the beginning
    editor.selection.setSelectionRange(new Range(0, 0, 0, 0));
    console.log('OPTS STRING: ' + optsString);
    editor.insert(optsString);

    // after inserting, the selection will be the line following
    // the insertion at column 0.

    // now check for categories
    console.log(editor.selection.getSelectionRange());
    found = findPageCategories(true);
    if (found.length) {
        ae.insertBlankLineMaybe();
        found.sort().each(function (catName) {
            editor.insert('@category.' + catName + ';\n');
        });
    }

    ae.insertBlankLineMaybe();
    return optsString;
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

function findVariables (found, remove, exp, bool) {
    var search = new Search().set({ needle: exp, regExp: true });

    // find each thing
    var ranges = search.findAll(editor.session);
    ranges.each(function (i) {
        var res = pageVariableFromRange(i, exp, bool);
        if (res) found[res.name] = res;
    });

    // remove maybe
    if (remove)
        ae.removeLinesInRanges(ranges);
}

function findPageOptions (remove) {
    var found = {};
    findVariables(found, remove, ae.expressions.keyValueVar);
    findVariables(found, remove, ae.expressions.boolVar, true);
    return found;
}

function findPageCategories (remove) {
    var found = {};
    findVariables(found, remove, ae.expressions.category, true);
    return Object.keys(found);
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

        string += '@page.' + optName;

        // boolean
        if (value === true)
            string += ';';

        // other value
        else {
            string += ':';

            // add however many spaces to make it line up
            if (optName.length < biggest)
                string += Array(biggest - optName.length).join(' ');

            // escape semicolons
            value = value.replace(/;/g, '\\;');

            string += value + ';';
        }

        string += '\n';
    });
    return string;
}

})(adminifier);
