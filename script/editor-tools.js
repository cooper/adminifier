Object.append(toolbarFunctions, {
    font:       displayFontSelector,
    link:       displayLinkHelper,
});

// PAGE TITLE SELECTOR

updateEditorTitle();
resetSelectionAtTopLeft();

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

// TEXT COLOR SELECTOR

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
    
    displayPopupBox(box, 200, li);  
}

// LINK HELPER

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
<span id="editor-link-title1">Page target</span><br />  \
<input id="editor-link-target" type="text" placeholder="My Page" />           \
<span id="editor-link-title2">Display text</span><br /> \
<input id="editor-link-display" type="text" placeholder="Click here" /><br/>  \
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
    
    // selected text = display text
    // choose a word if there is no actual selection
    var r = getSelectionRanges();
    editor.getSelection().setSelectionRange(r.select);
    var selected = editor.getSession().getTextRange(r.select);

    if (selected.trim().length) {
        $('editor-link-display').setProperty('value', selected);
        $('editor-link-target').setProperty('value', selected);
    }
    
    // insert click
    $('editor-link-insert').addEvent('click', function () {
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
        closeCurrentPopup();
    });
    
    displayPopupBox(box, 215, li);
}