document.addEvent('editorLoaded', editorLoadedHandler);
document.addEvent('pageUnloaded', editorToolsPageUnloadedHandler);

function editorLoadedHandler () {
    console.log('Editor tools script loaded');
    Object.append(toolbarFunctions, {
        font:       displayFontSelector,
        link:       displayLinkHelper,
        options:    displayPageOptionsWindow,
        view:       openPageInNewTab,
        delete:     displayDeleteConfirmation,
        save:       displaySaveHelper
    });
    
    addEditorKeyboardShortcuts([
        [ 'Ctrl-B', 'Command-B',    'bold'      ],
        [ 'Ctrl-I', 'Command-I',    'italic'    ],
        [ 'Ctrl-U', 'Command-U',    'underline' ],
        [ 'Ctrl-S', 'Command-S',    'save'      ],
        [ 'Ctrl-K', 'Command-K',    'link'      ]
    ]);

    updateEditorTitle();
    resetSelectionAtTopLeft();
}

function editorToolsPageUnloadedHandler () {
    console.log('Unloading editor tools script');
    document.removeEvent('editorLoaded', editorLoadedHandler);
    document.removeEvent('pageUnloaded', editorToolsPageUnloadedHandler);
}

// PAGE TITLE SELECTOR

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
    var box  = createPopupBox(rect.left, rect.top + li.offsetHeight);
    
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
    var box  = createPopupBox(rect.left, rect.top + li.offsetHeight);
    fakeAdopt(box);
    
    box.innerHTML = ' \
<div id="editor-link-type-internal" class="editor-link-type active" title="Page"><i class="fa fa-file-text"></i></div> \
<div id="editor-link-type-external" class="editor-link-type" title="External wiki page"><i class="fa fa-globe"></i></div> \
<div id="editor-link-type-category" class="editor-link-type" title="Category"><i class="fa fa-list"></i></div> \
<div id="editor-link-type-url" class="editor-link-type" title="External URL"><i class="fa fa-external-link"></i></div> \
<div style="clear: both;"></div>                        \
<div id="editor-link-wrapper">                       \
<span id="editor-link-title1">Page target</span><br />  \
<input id="editor-link-target" class="editor-full-width-input" type="text" placeholder="My Page" />           \
<span id="editor-link-title2">Display text</span><br /> \
<input id="editor-link-display" class="editor-full-width-input" type="text" placeholder="Click here" /><br/>  \
</div>                                                  \
<div id="editor-link-insert" class="editor-tool-large-button">Insert page link</div>  \
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
        closeCurrentPopup();
    };
    
    // insert on click or enter
    $('editor-link-insert').addEvent('click', insertLink);
    $('editor-link-target').onEnter(insertLink);
    $('editor-link-display').onEnter(insertLink);
    
    displayPopupBox(box, 215, li);
    $('editor-link-target').focus();
}

// VIEW PAGE BUTTON

function openPageInNewTab () {
    var root = adminifier.wikiPageRoot;
    var pageName = $('editor').getProperty('data-file').replace(/\.page$/, '');
    window.open(root + pageName);
}

// SAVE COMMIT HELPER

function displaySaveHelper () {
    var li   = $$('li[data-action="save"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = createPopupBox(rect.right - 300, rect.top + li.offsetHeight);
    box.addClass('right');
    fakeAdopt(box);
    
    box.innerHTML = '   \
<div id="editor-save-wrapper"> \
Edit summary<br /> \
<input id="editor-save-message" class="editor-full-width-input" type="text" placeholder="Updated ' + $('editor').getProperty('data-file') + '" /> \
</div> \
<div id="editor-save-commit" class="editor-tool-large-button">Commit changes</div>  \
';
    
    // save changes function
    var saveChanges = function () {
        var saveData = editor.getValue();
        
        // prevent box from closing for now
        box.addClass('sticky');
        var message = $('editor-save-message').getProperty('value');
        
        // "saving..."
        $('editor-save-wrapper').innerHTML = '<div style="text-align: center; line-height: 60px; height: 60px;"><i class="fa fa-spinner fa-3x fa-spin center"></i></div>'; // spinner
        var btn = $('editor-save-commit');
        btn.innerHTML = 'Comitting changes';
        btn.addClass('progress');
        
        // successful save callback
        var success = function (info) {
            editorLastSavedData = saveData;
            
            // switch to checkmark
            var i = btn.parentElement.getElementsByTagName('i')[0];
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-check-circle');

            // update button
            btn.addClass('success');
            btn.removeClass('progress');
            btn.innerHTML = info.unchanged ?
                'File unchanged' : 'Saved ' + info.id.substr(0, 7);

            setTimeout(function () { closeCurrentPopup(); }, 1500);  
        };
        
        // save failed callback
        var fail = function (msg) {
            alert('Save failed: ' + msg);
            
            // switch to /!\
            var i = btn.parentElement.getElementsByTagName('i')[0];
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-exclamation-triangle');

            // update button
            btn.addClass('failure');
            btn.removeClass('progress');
            btn.innerHTML = 'Save failed';

            setTimeout(function () { closeCurrentPopup(); }, 1500);  
        };
        
        // save request
        var req = new Request.JSON({
            url: 'functions/write-page.php',
            onSuccess: function (data) {
                
                // updated without error
                if (data.success)
                    success(data.rev_info);
                
                // revision error
                else {
                    
                    // nothing changed
                    if (data.rev_error && data.rev_error.match('no changes'))
                        success({ unchanged: true });
                    
                    // true failure
                    else
                        fail(data.rev_error);
                    
                }
            },
            onFailure: function () { fail('Request error') },
        }).post({
            page:       $('editor').getProperty('data-file'),
            content:    saveData,
            message:    message
        });

    };
    
    // on click or enter, save changes
    $('editor-save-commit').addEvent('click', saveChanges);
    $('editor-save-message').onEnter(saveChanges);
    
    displayPopupBox(box, 120, li);
    $('editor-save-message').focus();
}

// DELETE CONFIRMATION

function displayDeleteConfirmation () {
    var li   = $$('li[data-action="delete"]')[0];
    var rect = li.getBoundingClientRect();
    var box  = createPopupBox(rect.right - 300, rect.top + li.offsetHeight);
    box.addClass('right');
    fakeAdopt(box);
    
    box.innerHTML = '   \
<div id="editor-delete-wrapper"> \
    <i class="fa fa-3x center fa-question-circle"></i> \
</div> \
<div id="editor-delete-button" class="editor-tool-large-button">Are you sure?</div>  \
';
    
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
        $('editor-delete-wrapper').innerHTML = '<i class="fa fa-spinner fa-3x fa-spin center"></i>'; // spinner
        btn.innerHTML = 'Deleting page';
        btn.addClass('progress');
        
        // success callback
        var success = function () {
            
            // switch to checkmark
            var i = btn.parentElement.getElementsByTagName('i')[0];
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-check-circle');

            // update button
            btn.addClass('success');
            btn.removeClass('progress');
            btn.innerHTML = 'File Deleted';

            // redirect
            setTimeout(function () {
                window.location = adminifier.adminRoot
            }, 1500);
            
        };
        
        var fail = function () {

            // switch to /!\
            var i = btn.parentElement.getElementsByTagName('i')[0];
            i.removeClass('fa-spinner');
            i.removeClass('fa-spin');
            i.addClass('fa-exclamation-triangle');

            // update button
            btn.addClass('failure');
            btn.removeClass('progress');
            btn.innerHTML = 'Delete failed';

            setTimeout(function () { closeCurrentPopup(); }, 1500);
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
            page: $('editor').getProperty('data-file')
        });
        
    };
    
    // on click, delete page
    btn.addEvent('click', deletePage);
    
    displayPopupBox(box, 120, li);
}

// PAGE OPTIONS

function displayPageOptionsWindow () {
    var found = findPageOptions();
    
    // this will actually be passed user input
    var optsString = generatePageOptions({
        title:      found.title.value,
        created:    found.created.value,
        author:     found.author.value,
        draft:      found.draft.value
    });
    
    return optsString;
}

function findPageOptions () {

    // remember the current selection
    var originalRange = editor.getSelection().getRange();
    
    var find = function (exp) {
        var found = editor.find(exp, { regExp: true, wrap: true });
        if (!found) return;
        var value = editor.getSelectedText().match(exp)[1];
        return {
            text:  editor.getSelectedText(),
            value: typeof value != 'undefined' ? value.trim().replace(/;$/, '') : true,
            range: found
        };
    };
    
    // find stuff
    var found = {
        title:   find(editorExpressions.pageTitle),
        created: find(editorExpressions.pageCreated),
        author:  find(editorExpressions.pageAuthor),
        draft:   find(editorExpressions.pageDraft)
    };
  
    // revert to the original selection
    editor.getSelection().setSelectionRange(originalRange);

    return found;
}

function generatePageOptions (opts) {
    var string = '';
    ['title', 'created', 'author', 'draft'].each(function (optName) {
        
        // not present
        var value = opts[optName];
        if (typeof value == 'undefined') return;
        
        string += '@page.' + optName;
        
        // boolean
        if (value === true) 
            string += ';';
        
        // other value
        else
            string += ': ' + value + ';';
        
        string += '\n';
    });
    return string + '\n';
}