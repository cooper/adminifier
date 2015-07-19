console.log('Edit page script loaded');

var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.getSession().setMode("ace/mode/plain_text");
editor.resize();