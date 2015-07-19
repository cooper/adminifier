console.log('Edit page script loaded');

var Range = ace.require('ace/range').Range;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
editor.getSession().setMode("ace/mode/plain_text");
editor.resize();

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
        if (typeof char == 'undefined')
            return false;
        
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