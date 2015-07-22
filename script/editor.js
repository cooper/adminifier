var Range, editor, currentLi, currentPopup, editorLastSavedData;

document.addEvent('pageScriptsLoaded', editorPageScriptsLoadedHandler);
document.addEvent('pageUnloaded', editorPageUnloadedHandler);
document.addEvent('keyup', handleEditorEscapeKey);

function editorPageUnloadedHandler () {
    console.log('Unloading editor script');
    document.removeEvent('pageScriptsLoaded', editorPageScriptsLoadedHandler);
    document.removeEvent('pageUnloaded', editorPageUnloadedHandler);
    document.removeEvent('keyup', handleEditorEscapeKey);
    document.body.removeEvent('click', editorClickOutHandler);
}
                  
function editorPageScriptsLoadedHandler () {
    console.log('Editor script loaded');
    setupToolbar();
    window.addEvent('resize', movePopupBox);
    
    Range  = ace.require('ace/range').Range;
    editor = ace.edit("editor");
    editorLastSavedData = editor.getValue();
    
    // render editor
    editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
    editor.getSession().setMode("ace/mode/plain_text");
    editor.on('input', editorInputHandler);
    setTimeout(function () { editor.resize(); }, 500);

    // listen for clicks to navigate away
    document.body.addEvent('click', editorClickOutHandler);
    
    window.editorLoaded = true;
    document.fireEvent('editorLoaded');
}

function editorClickOutHandler (e) {
    if (!editorHasUnsavedChanges()) return;
    console.log(e.target);
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

function editorConfirmOnPageExit (e) {
    var message = 'You have unsaved changes.';
    if (e) e.returnValue = message;
    return message;
}

var editorExpressions = {
    pageTitle:      new RegExp('^@page\\.title:(.*)$'),
    pageAuthor:     new RegExp('^@page\\.author:(.*)$'),
    pageCreated:    new RegExp('^@page\\.created:(.*)$')
};

function resetSelectionAtTopLeft () {
    editor.getSelection().setSelectionRange(new Range(0, 0, 0, 0));
    editor.focus();
}

// escape key pressed
function handleEditorEscapeKey(e) {
    if (e.key != 'esc') return;
    console.log('handle escape');
    
    // if there's a popup, exit it maybe
    if (currentPopup)
        closeCurrentPopup(true);
    
}

function editorInputHandler () {
    
    // update undo
    var um = editor.getSession().getUndoManager();
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
    if (lineText.match(editorExpressions.pageTitle)) {
        var pos = editor.getCursorPosition();
        var rng = new Range(pos.row, pos.column, pos.row, pos.column);
        updateEditorTitle();
        editor.getSelection().setSelectionRange(rng);
    }
        
    // changes?
    window.onbeforeunload = editorHasUnsavedChanges() ? editorConfirmOnPageExit : null;
    
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
    if (!currentPopup) return;
    
    console.log(e.target);
    
    // the target is the toolbar item
    var li =  currentPopup.retrieve('li');
    if (e.target == li || li.contains(e.target))
        return;
    
    // this popup can only be closed programmatically
    if (currentPopup.hasClass('sticky'))
        return;
    
    // clicked within the popup
    if (e.target == currentPopup || currentPopup.contains(e.target))
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

function closeCurrentPopup (maybe) {
    var box = currentPopup;
    if (!box) return;
    
    // if maybe, check if sticky.
    if (maybe && box.hasClass('sticky'))
        return;
    
    closeCurrentLi();
    box.set('morph', {
        duration: 150,
        onComplete: function () { if (box) box.destroy(); }
    });
    box.morph({ height: '0px' });
    currentPopup = null;
}

function createPopupBox (posX, posY) {
    
    // already showing something
    if (currentPopup) return;
    
    // create box
    var box = new Element('div', {
        class: 'editor-popup-box',
        styles: {
            top:  posY,
            left: posX
        }
    });
    
    return box;
}

function displayPopupBox (box, height, li) {
    openLi(li);
    document.body.appendChild(box);
    box.set('morph', { duration: 150 });
    box.morph({ height: height + 'px' });
    box.store('li', li);
    currentPopup = box;
}

// move a popup when the window resizes
function movePopupBox () {
    if (!currentPopup) return;
    var li   = currentPopup.retrieve('li');
    var rect = li.getBoundingClientRect();
    currentPopup.setStyle('left',
        currentPopup.hasClass('right') ?
        rect.right - 300 :
        rect.left
    );
    currentPopup.setStyle('top', rect.top + li.offsetHeight);
}

// find an appropriate range for selection
function getSelectionRanges() {
    
    // find the current selection
    var selectRange = editor.getSelection().getRange();
    var originalRange = selectRange;

    // if there is no actual selection (just a cursor position),
    // use the word range. but only if it's in a word (check strlen).
    if (selectRange.isEmpty()) {
        var wordRange = editor.getSelection().getWordRange();
        if (editor.getSession().getTextRange(wordRange).trim().length)
            selectRange = wordRange;
    }
    
    return {
        original: originalRange,
        select: selectRange
    }
}

// this is useful for replacing a range of text
// with something that surrounds it, such as [b]...[/b]
// because it re-selects the original selection
// after performing the operation: [b]<sel>...</sel>[/b]
function replaceSelectionRangeAndReselect (ranges, leftOffset, newText) {
    var selectRange = ranges.select,
        originalRange = ranges.original;
    
    // replace the text
    editor.getSession().replace(selectRange, newText);

    // return to the original selection
    editor.getSelection().setSelectionRange(new Range(
        originalRange.start.row,
        originalRange.start.column + leftOffset,
        originalRange.end.row,
        originalRange.end.column + leftOffset
    ));
    
}

function wrapTextFunction (type) {
    return function () {
        
        var r = getSelectionRanges();
        var selectRange = r.select,
            originalRange = r.original;
        editor.getSelection().setSelectionRange(selectRange);
        
        // dtermine the new text
        var terminator  = type.length > 1 ? '' : type;
        var leftSide    = '[' + type + ']';
        var newText     = leftSide + editor.getSelectedText() + '[/' + terminator + ']';
        
        // replace the text and select the original text
        replaceSelectionRangeAndReselect(r, leftSide.length, newText);
      
        closeCurrentPopup();
    };
}

function dummyFunc () { console.log('button pressed'); }

var toolbarFunctions = {
    bold:       wrapTextFunction('b'),
    italic:     wrapTextFunction('i'),
    underline:  wrapTextFunction('u'),
    strike:     wrapTextFunction('s'),
    undo:       function () { editor.undo(); },
    redo:       function () { editor.redo(); },
    'delete':   dummyFunc
};

function openLi (li) {
    
    // if a popup is open, ignore this.
    if (currentPopup) return;

    // if another one is animating, force it to instantly finish
    if (currentLi)
        closeCurrentLi();

    // animate this one
    li.morph({
        width: '100px',
        backgroundColor: '#2096ce'
    });

    currentLi = li;
}

function closeCurrentLi () {
    if (!currentLi) return;
    currentLi.morph({
        width: '15px',
        backgroundColor: '#696969'
    });
    currentLi = null;
}

function addEditorKeyboardShortcuts (cuts) {
    // c = [ windows shortcut, mac shortcut, action ]
    cuts.each(function (c) {
        editor.commands.addCommand({
            name: c[2],
            bindKey: {
                windows: c[0],
                mac:     c[1]
            },
            exec: toolbarFunctions[ c[2] ]
        });
    });
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
            if (li.hasClass('disabled')) return;
            if (currentPopup) return;
            var action = li.getAttribute('data-action');
            if (!action) return;
            var func = toolbarFunctions[action];
            if (!func) return;
            func();
        });
        
    });
    
    // leaving the toolbar, close it
    $$('ul.editor-toolbar').addEvent('mouseleave', function () {
        if (currentLi && !currentPopup)
            closeCurrentLi();
    });
    
}

function editorHasUnsavedChanges () {
    return editor.getValue() != editorLastSavedData;
}