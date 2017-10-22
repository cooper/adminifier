function goToHelpAnchor (hash) {
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
        goToHelpAnchor(match[1]);
})();
