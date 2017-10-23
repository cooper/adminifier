function goToHelpAnchor (hash) {
    window.preventHashLoad = true;
    window.location.hash.replace(/#([^\/]+)$/, '');
    window.location.hash += '#' + hash;
    handleHelpHash(hash);
}

function handleHelpHash (hash) {
    var anchor = 'wiki-anchor-' + hash;
    var el = $(anchor);
    if (el) {
        pos = el.getPosition();
        scrollTo(pos.x, pos.y - 50); // add 50 for header
    }
}

(function () {
    var match = window.location.hash.match(/#([^\/]+)$/);
    if (match)
        handleHelpHash(match[1]);
})();

if (window.retinajs)
    retinajs();
