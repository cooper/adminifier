console.log('Edit page script loaded');

var Range = ace.require('ace/range').Range;

var editor = ace.edit("editor");
editor.setTheme("ace/theme/twilight"); /* eclipse is good light one */
editor.getSession().setMode("ace/mode/plain_text");
editor.resize();

function dummyFunc () { }

function selectPageTitle () {
    var found = editor.find('^@page\.title:(.*)$', { regExp: true });
    if (!found) return false;
    var string = editor.getSelectedText();
    
    var escaped = false, inTitle = false, startIndex = 0, endIndex = 0;
    for (var i = 0; true; i++) {
        var char = string[i];
        
        // made it to the end without finding semicolon
        if (typeof char == 'undefined')
            return false;
        
        // now we're in the title
        if (!inTitle && char == ':') {
            inTitle = true;
            startIndex = i - 1;
            continue;
        }
        
        // ending the title
        if (inTitle && !escaped && char == ';') {
            endIndex = i - 1;
            break;
        }
    }

    editor.selection.setSelectionRange(new Range(found.row, startIndex, found.row, endIndex));
    return true;
}