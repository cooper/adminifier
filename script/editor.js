console.log('Edit page script loaded');
document.addEvent('domready', setupToolbar);

var Range = ace.require('ace/range').Range;
var editor = ace.edit("editor");
var currentLi;

var editorExpressions = {
    version:        1.0,
    pageTitle:      new RegExp('^@page\\.title:(.*)$'),
    pageAuthor:     new RegExp('^@page\\.author:(.*)$'),
    pageCreated:    new RegExp('^@page\\.created:(.*)$')
};

editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
editor.getSession().setMode("ace/mode/plain_text");
setTimeout(function () { editor.resize(); }, 500);

updateEditorTitle();
editor.getSelection().setSelectionRange(new Range(0, 0, 0, 0));
editor.focus();

editor.on('input', function () {
    
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
        
});


function selectPageTitle () {
    var range = getPageTitleRange();
    if (range) editor.selection.setSelectionRange(range);
}

function getPageTitle () {
    var range = getPageTitleRange();
    if (range) return editor.getSession().getTextRange(range);
    return;
}

// TODO: this doesn't yet handle escaped semicolons
function getPageTitleRange () {
    var found = editor.find(editorExpressions.pageTitle, { regExp: true, wrap: true });
    if (!found) return;
    var string = editor.getSelectedText();
    
    var escaped = false,
        inTitle = false,
        foundText = false,
        startIndex = 0,
        endIndex = 0;
    
    for (var i = 0; ; i++) {
        var char = string[i];
        
        // made it to the end without finding semicolon
        if (typeof char == 'undefined') {
            endIndex = i;
            break;
        }
        
        // now we're in the title
        if (!inTitle && char == ':') {
            inTitle = true;
            startIndex = i + 1;
            continue;
        }
        
        // if we're in the title but no text has been found,
        // this is just spacing before the actual title
        if (inTitle && !foundText && char == ' ') {
            startIndex++;
            continue;
        }
                
        // ending the title
        if (inTitle && !escaped && char == ';') {
            endIndex = i;
            break;
        }
        
        if (inTitle)
            foundText = true;
        
    }
    
    // offset on the line
    startIndex += found.start.column;
    endIndex   += found.start.column;
    
    console.log('startIndex: ' + startIndex + ', endIndex: ' + endIndex);
    return new Range(found.start.row, startIndex, found.end.row, endIndex);
}

// find the page title
function updateEditorTitle() {
    var title = getPageTitle();
    if (typeof title != 'undefined' && title.length)
        updatePageTitle(title);
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

function displayFontSelector () {
    var li   = $$('li[data-action="font"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = createPopupBox(rect.top + li.offsetHeight, rect.left);

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
        div.innerHTML = '<span style="padding-left: 10px;">' +
            colorName.replace(/([A-Z])/g, ' $1') + '</span>';
        container.appendChild(div);
        
        // compute and set the appropriate text color
        var color = new Color(getComputedStyle(div, null).getPropertyValue('background-color'));
        div.setStyle('color', getContrastYIQ(color.hex.substr(1)));
        
        // add click event
        div.addEvent('click', wrapTextFunction(colorName));
        
    });
    
    // put it where it belongs
    container.parentElement.removeChild(container);
    container.setStyle('display', 'block');
    box.appendChild(container);
    
    displayPopupBox(box, 200);    
}

function displayLinkHelper () {
    var li   = $$('li[data-action="link"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = createPopupBox(rect.top + li.offsetHeight, rect.left);
    fakeAdopt(box);
    box.innerHTML = ' \
<div id="editor-link-type-internal" class="editor-link-type active" title="Page"><i class="fa fa-file-text"></i></div> \
<div id="editor-link-type-external" class="editor-link-type" title="External wiki page"><i class="fa fa-globe"></i></div> \
<div id="editor-link-type-category" class="editor-link-type" title="Category"><i class="fa fa-list"></i></div> \
<div id="editor-link-type-url" class="editor-link-type" title="External URL"><i class="fa fa-external-link"></i></div> \
<div style="clear: both;"></div>                        \
<div id="editor-link-wrapper">                       \
<span id="editor-link-title2">Display text</span><br /> \
<input id="editor-link-display" type="text" placeholder="Click here" /><br/>  \
<span id="editor-link-title1">Page target</span><br />  \
<input id="editor-link-target" type="text" placeholder="My Page" />           \
</div>                                                  \
<div id="editor-link-insert">Insert page link</div>  \
';
    
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
    
    displayPopupBox(box, 205);
}

function getContrastYIQ (hexColor) {
    var r = parseInt(hexColor.substr(0, 2), 16);
    var g = parseInt(hexColor.substr(2, 2), 16);
    var b = parseInt(hexColor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000' : '#fff';
}

function closeCurrentPopup () {
    var box = $$('div.editor-popup-box')[0];
    if (!box) return;
    closeCurrentLi();
    box.set('morph', {
        duration: 150,
        onComplete: function () { if (box) box.destroy(); }
    });
    box.morph({ height: '0px' });
}

function createPopupBox (posX, posY) {
    
    // already showing something
    var displayedPopup = $$('div.editor-popup-box')[0];
    if (displayedPopup) return;
    
    // create box
    var box = new Element('div', {
        class: 'editor-popup-box',
        styles: {
            top:  posX,
            left: posY
        }
    });
    
    // on mouse leave, animate exit
    box.addEvent('mouseleave', closeCurrentPopup);
    
    return box;
}

function displayPopupBox (box, height) {
    document.body.appendChild(box);
    box.set('morph', { duration: 150 });
    box.morph({ height: height + 'px' });
}

function wrapTextFunction (type) {
    return function () {
        
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
        
        editor.getSelection().setSelectionRange(selectRange);
        
        // dtermine the new text
        var terminator  = type.length > 1 ? '' : type;
        var leftSide    = '[' + type + ']';
        var newText     = leftSide + editor.getSelectedText() + '[/' + terminator + ']';
        
        // replace the text
        editor.getSession().replace(selectRange, newText);
        
        // return to the original selection
        editor.getSelection().setSelectionRange(new Range(
            originalRange.start.row,
            originalRange.start.column + leftSide.length,
            originalRange.end.row,
            originalRange.end.column + leftSide.length
        ));
        
    };
}

function dummyFunc () { console.log('button pressed'); }

var toolbarFunctions = {
    bold:       wrapTextFunction('b'),
    italic:     wrapTextFunction('i'),
    underline:  wrapTextFunction('u'),
    strike:     wrapTextFunction('s'),
    font:       displayFontSelector,
    link:       displayLinkHelper,
    undo:       function () { editor.undo(); },
    redo:       function () { editor.redo(); },
    'delete':   dummyFunc
};

function closeCurrentLi () {
    if (!currentLi) return;
    currentLi.morph({
        width: '15px',
        backgroundColor: '#696969'
    });
    currentLi = undefined;
}

function setupToolbar () {

    // switch between buttons
    $$('ul.editor-toolbar li').each(function (li) {
        
        // hover animation
        li.set('morph', { duration: 150 });
        li.addEvent('mouseenter', function () {
            closeCurrentPopup();

            // if another one is animating, force it to instantly finish
            if (currentLi)
                closeCurrentLi();
            
            // animate this one
            li.morph({
                width: '100px',
                backgroundColor: '#2096ce'
            });
            
            currentLi = li;
        });
        
        // clicked
        li.addEvent('click', function () {
            if (li.hasClass('disabled')) return;
            var action = li.getAttribute('data-action');
            if (!action) return;
            var func = toolbarFunctions[action];
            if (!func) return;
            func();
        });
        
    });
    
    // leaving the toolbar, close it
    $$('ul.editor-toolbar').addEvent('mouseleave', function () {
        var displayedPopup = $$('div.editor-popup-box')[0];
        if (currentLi && !displayedPopup)
            closeCurrentLi();
    });
    
}