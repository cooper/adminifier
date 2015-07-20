console.log('Edit page script loaded');
document.addEvent('domready', setupToolbar);

var Range = ace.require('ace/range').Range;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
editor.getSession().setMode("ace/mode/plain_text");
setTimeout(function () { editor.resize(); }, 500);

function dummyFunc () { }

function selectPageTitle () {
    var found = editor.find('^@page\.title:(.*)$', { regExp: true, wrap: true });
    if (!found) return false;
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
    editor.selection.setSelectionRange(new Range(found.start.row, startIndex, found.end.row, endIndex));
    return true;
}

function setupToolbar () {
    var currentLi;

    // switch between buttons
    $$('ul.editor-toolbar li').each(function (li) {
        li.set('morph', { duration: 150 });
        li.addEvent('mouseenter', function () {

            // if another one is animating, force it to instantly finish
            if (currentLi) {
                currentLi.morph({
                    width: '15px',
                    backgroundColor: '#696969'
                });
                currentLi = undefined;
            }
            
            // animate this one
            li.morph({
                width: '100px',
                backgroundColor: '#2096ce'
            });
            
            currentLi = li;
        });
    });
    
    // leaving the toolbar, close it
    $$('ul.editor-toolbar').addEvent('mouseleave', function () {
        if (currentLi) {
            currentLi.morph({
                width: '15px',
                backgroundColor: '#696969'
            });
            currentLi = undefined;
        }
    });
    
}