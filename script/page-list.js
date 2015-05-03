(function () {
    if (!data['data-sort']) return;
    var split = data['data-sort'].split('');
    var sort = split[0], order = split[1];
    var char = order == '+' ? 'caret-up' : 'caret-down';
    $$('td[data-sort="' + sort + '"] a')[0].innerText += ' ' + char;
})();