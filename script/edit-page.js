console.log('Edit page script loaded');

var editor = ace.edit("editor");
editor.setTheme("ace/theme/idle_fingers"); /* eclipse is good light one */
editor.getSession().setMode("ace/mode/plain_text");
editor.resize();