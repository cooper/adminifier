console.log('Edit page script loaded');

var editor = ace.edit("editor");
editor.setTheme("ace/theme/eclipse");
editor.getSession().setMode("ace/mode/plain_text");

window.addEvent('resize', function () {
    editor.setStyle('height', window.innerHeight - $('top-bar').offsetHeight + 'px');
    editor.resize();
});