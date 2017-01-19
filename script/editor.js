var Range, editor;
adminifier.editor = {};
(function (a, ae) {

Element.Events.editorLoaded = {
    onAdd: function (fn) {
        if (ae.editorLoaded)
            fn.call(this);
    }
};

document.addEvent('pageScriptsLoaded', pageScriptsLoadedHandler);
document.addEvent('pageUnloaded', pageUnloadedHandler);
document.addEvent('keyup', handleEscapeKey);

ae.expressions = {
    pageTitle:      new RegExp('\\s*^@page\\.title:(.*)$'),
    keyValueVar:    new RegExp('^\\s*@page\\.(\\w+):(.*?)(;?)\\s*$'),
    boolVar:        new RegExp('^\\s*@page\\.(\\w+);\\s*$'),
    category:       new RegExp('^\\s*@category\\.(\\w+);\\s*$')
};

ae.toolbarFunctions = {
    bold:       wrapTextFunction('b'),
    italic:     wrapTextFunction('i'),
    underline:  wrapTextFunction('u'),
    strike:     wrapTextFunction('s'),
    undo:       function () { editor.undo(); },
    redo:       function () { editor.redo(); },
    // 'delete':   dummyFunc
};

ae.getFilename = function () {
    return $('editor').getProperty('data-file');
};

// returns the page title text, with any escapes accounted for.
// returns nothing if the @page.title can't be found.
ae.getPageTitle = function () {
    var found = ae.findPageVariable(ae.expressions.pageTitle);
    if (!found)
        return;
    return found.text;
};

// update the page title to whatever @page.title says
ae.updatePageTitle = function () {
    var title = ae.getPageTitle();
    if (typeof title == 'undefined')
        return;
    if (title.length)
        a.updatePageTitle(title);
    else
        a.updatePageTitle(ae.getFilename());
};

ae.addKeyboardShortcuts = function (cuts) {
    // c = [ windows shortcut, mac shortcut, action ]
    cuts.each(function (c) {
        editor.commands.addCommand({
            name: c[2],
            bindKey: {
                windows: c[0],
                mac:     c[1]
            },
            exec: ae.toolbarFunctions[ c[2] ]
        });
    });
};

ae.hasUnsavedChanges = function () {
    return editor.getValue() != ae.lastSavedData;
};

ae.closePopup = function (box, opts) {
    if (!ae.currentPopup)
        return;
    if (ae.currentPopup != box) {
        console.warn(
            'Attempted to close a box other than the current one',
            box,
            ae.currentPopup
        );
        return;
    }
    closeCurrentPopup(opts);
};

ae.findPageVariable = function (exp) {
    var found = editor.find(exp, { regExp: true, wrap: true });
    if (!found)
        return;
    var string = editor.getSelectedText();

    var escaped = false,
        inTitle = false,    inName = false,
        foundText = '',     foundName = '',
        startIndex = 0,     endIndex = 0;

    for (var i = 0; ; i++) {
        var char = string[i];

        // made it to the end without finding unescaped semicolon
        if (typeOf(char) == 'null') {
            endIndex = i;
            break;
        }

        // escapes
        var escaped = string[i - 1] == '\\';
        if (char == '\\' && !escaped) {
            continue;
        }

        // now we're in the title
        if (!startIndex && char == ':') {
            inName  = false;
            inTitle = true;
            startIndex = i + 1;
            continue;
        }

        if (!startIndex && char == '.' && !inName) {
            inName = true;
            continue;
        }

        // if we're in the title but no text has been found,
        // this is just spacing before the actual title
        if (inTitle && !foundText.length && char == ' ') {
            startIndex++;
            continue;
        }

        // ending the title
        if (inTitle && !escaped && char == ';') {
            endIndex = i;
            break;
        }

        // ending a bool var
        if (inName && char == ';')
            break;

        if (inTitle)
            foundText += char;
        else if (inName)
            foundName += char;
    }

    // offset on the line
    startIndex += found.start.column;
    endIndex   += found.start.column;

    return {
        name: foundName,
        text: foundText,
        range: new Range(found.start.row, startIndex, found.end.row, endIndex)
    };
};

ae.insertBlankLineMaybe = function () {

    // select the line following the var insertion.
    editor.selection.selectLine();

    // if there is text on the line, insert a blank line before it.
    if (editor.getSelectedText().trim().length) {
        var r = editor.selection.getRange();
        editor.selection.setSelectionRange(new Range(
            r.start.row, 0,
            r.start.row, 0
        ));
        editor.insert('\n');
        return true;
    }

    return false;
};

ae.removeLinesInRanges = function (ranges) {

    // get line numbers in descending order
    // (starting from the bottom)
    var lines = ranges.map(function (r) {
        return [ r.start.row, r.end.row ];
    }).flatten().unique().sort(function (a, b) { return b - a });

    // remove each line
    lines.each(function (line) {
        var r = new Range(line, 0, line, 0);
        editor.selection.setSelectionRange(r);
        editor.removeLines();
    });
};

ae.resetSelectionAtTopLeft = function () {
    editor.selection.setSelectionRange(new Range(0, 0, 0, 0));
    editor.focus();
};

ae.createPopupBox = function (posX, posY) {

    // already showing something
    if (ae.currentPopup)
        return;

    // create box
    var box = new Element('div', {
        class: 'editor-popup-box',
        styles: {
            top:  posY,
            left: posX
        }
    });

    return box;
};

ae.displayPopupBox = function (box, height, li) {
    openLi(li);
    document.body.appendChild(box);
    box.set('morph', { duration: 150 });
    box.morph({ height: height + 'px' });
    box.store('li', li);
    ae.currentPopup = box;
};

// find an appropriate range for selection
ae.getSelectionRanges = function () {

    // find the current selection
    var selectRange = editor.selection.getRange();
    var originalRange = selectRange;

    // if there is no actual selection (just a cursor position),
    // use the word range. but only if it's in a word (check strlen).
    // also check if it strictly non-word chars, such as a symbol.
    if (selectRange.isEmpty()) {
        var wordRange = editor.selection.getWordRange();
        var word = editor.session.getTextRange(wordRange).trim();
        if (word.length && !word.match(/^\W*$/))
            selectRange = wordRange;
    }

    return {
        original: originalRange,
        select: selectRange
    }
};

// this is useful for replacing a range of text
// with something that surrounds it, such as [b]...[/b]
// because it re-selects the original selection
// after performing the operation: [b]<sel>...</sel>[/b]
ae.replaceSelectionRangeAndReselect = function (ranges, leftOffset, newText) {
    var selectRange = ranges.select,
        originalRange = ranges.original;

    // replace the text
    editor.session.replace(selectRange, newText);

    // return to the original selection
    editor.selection.setSelectionRange(new Range(
        originalRange.start.row,
        originalRange.start.column + leftOffset,
        originalRange.end.row,
        originalRange.end.column + leftOffset
    ));
};

function pageUnloadedHandler () {
    console.log('Unloading editor script');
    document.removeEvent('pageScriptsLoaded', pageScriptsLoadedHandler);
    document.removeEvent('pageUnloaded', pageUnloadedHandler);
    document.removeEvent('keyup', handleEscapeKey);
    document.body.removeEvent('click', clickOutHandler);
    window.removeEvent('resize', adjustCurrentPopup);
    window.onbeforeunload = null;
}

function pageScriptsLoadedHandler () {
    console.log('Editor script loaded');
    setupToolbar();
    window.addEvent('resize', adjustCurrentPopup);

    Range  = ace.require('ace/range').Range;
    editor = ace.edit("editor");
    ae.lastSavedData = editor.getValue();

    // render editor
    editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
    editor.session.setMode("ace/mode/plain_text");
    editor.on('input', inputHandler);
    setTimeout(function () { editor.resize(); }, 500);

    // listen for clicks to navigate away
    document.body.addEvent('click', clickOutHandler);

    ae.editorLoaded = true;
    document.fireEvent('editorLoaded');
}

function clickOutHandler (e) {
    if (!ae.hasUnsavedChanges())
        return;
    var findParent = function (tagname, el) {
        if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase())
            return el;
        while (el = el.parentNode) {
            if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase())
                return el;
        }
        return null;
    }
    var from = findParent('a', e.target);
    console.log(from);
    if (from) {
        e.preventDefault();
        alert('You have unsaved changes.');
    }
}

function confirmOnPageExit (e) {
    var message = 'You have unsaved changes.';
    if (e) e.returnValue = message;
    return message;
}

// escape key pressed
function handleEscapeKey(e) {
    if (e.key != 'esc') return;
    console.log('handle escape');

    // if there's a popup, exit it maybe
    if (ae.currentPopup)
        closeCurrentPopup({ unlessSticky: true });
}

function inputHandler () {

    // update undo
    var um = editor.session.getUndoManager();
    if (um.hasUndo())
        $('toolbar-undo').removeClass('disabled')
    else
        $('toolbar-undo').addClass('disabled');

    // update redo
    if (um.hasRedo())
        $('toolbar-redo').removeClass('disabled');
    else
        $('toolbar-redo').addClass('disabled');


    // current line
    var lineText = editor.session.getLine(editor.getSelectionRange().start.row);

    // we're changing the title.
    // this shouldn't be too expensive, since
    // editor.find() starts with the current line
    if (lineText.match(ae.expressions.pageTitle)) {
        var pos = editor.getCursorPosition();
        var rng = new Range(pos.row, pos.column, pos.row, pos.column);
        ae.updatePageTitle();
        editor.selection.setSelectionRange(rng);
    }

    // changes?
    window.onbeforeunload =
        ae.hasUnsavedChanges()  ?
        confirmOnPageExit       :
        null;
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

// close current popup on click outside
function bodyClickPopoverCheck (e) {

    // no popup is displayed
    if (!ae.currentPopup)
        return;

    console.log(e.target);

    // the target is the toolbar item
    var li = ae.currentPopup.retrieve('li');
    if (e.target == li || li.contains(e.target))
        return;

    // this popup can only be closed programmatically
    if (ae.currentPopup.hasClass('sticky'))
        return;

    // clicked within the popup
    if (e.target == ae.currentPopup || ae.currentPopup.contains(e.target))
        return;

    closeCurrentPopup();
}

function getContrastYIQ (hexColor) {
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000' : '#fff';
}

function closeCurrentPopup (opts) {
    var box = ae.currentPopup;
    if (!box)
        return;
    if (!opts)
        opts = {};

    // check if sticky
    if (opts.unlessSticky && box.hasClass('sticky')) {
        console.log('Keeping popup open because it is marked sticky');
        return;
    }

    // check if mouse is over it.
    // note this will only work if the box has at least one child with
    // the hover selector active
    if (opts.unlessActive && box.getElement(':hover')) {
        console.log('Keeping popup open because mouse is over it');

        // once the mouse exits, close it
        box.addEvent('mouseleave', function () {
            ae.closePopup(box, opts);
        });

        return;
    }

    closeCurrentLi();
    box.set('morph', {
        duration: 150,
        onComplete: function () { if (box) box.destroy(); }
    });
    box.morph({ height: '0px' });
    ae.currentPopup = null;
}

// move a popup when the window resizes
function adjustCurrentPopup () {
    var box = ae.currentPopup;
    if (!box)
        return;
    var li   = box.retrieve('li');
    var rect = li.getBoundingClientRect();
    box.setStyle('left',
        box.hasClass('right') ?
        rect.right - 300 :
        rect.left
    );
    box.setStyle('top', rect.top + li.offsetHeight);
};

function wrapTextFunction (type) {
    return function () {

        var r = ae.getSelectionRanges();
        var selectRange = r.select,
            originalRange = r.original;
        editor.selection.setSelectionRange(selectRange);

        // dtermine the new text
        var terminator  = type.length > 1 ? '' : type;
        var leftSide    = '[' + type + ']';
        var newText     = leftSide + editor.getSelectedText() + '[/' + terminator + ']';

        // replace the text and select the original text
        ae.replaceSelectionRangeAndReselect(r, leftSide.length, newText);

        closeCurrentPopup();
    };
}

function openLi (li) {

    // if a popup is open, ignore this.
    if (ae.currentPopup)
        return;

    // if another one is animating, force it to instantly finish
    if (ae.currentLi)
        closeCurrentLi();

    // animate this one
    li.morph({
        width: '100px',
        backgroundColor: '#2096ce'
    });

    ae.currentLi = li;
}

function closeCurrentLi () {
    if (!ae.currentLi)
        return;
    ae.currentLi.morph({
        width: '15px',
        backgroundColor: '#696969'
    });
    ae.currentLi = null;
}

function setupToolbar () {
    document.body.addEvent('click', bodyClickPopoverCheck);

    // switch between buttons
    $$('ul.editor-toolbar li').each(function (li) {

        // hover animation
        li.set('morph', { duration: 150 });
        li.addEvent('mouseenter', function () {
            openLi(li);
        });

        // clicked
        li.addEvent('click', function (e) {

            // disabled or another popup is being displayed
            if (li.hasClass('disabled') || ae.currentPopup)
                return;

            // no action? not sure what to do
            var action = ae.toolbarFunctions[ li.getAttribute('data-action') ];
            if (!action)
                return;

            action();
        });

    });

    // leaving the toolbar, close it
    $$('ul.editor-toolbar').addEvent('mouseleave', function () {
        if (ae.currentLi && !ae.currentPopup)
            closeCurrentLi();
    });
}

})(adminifier, adminifier.editor);
