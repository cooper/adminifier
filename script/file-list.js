var FileList = new Class({
    
    Implements: [Options, Events],
    
    options: {
        columns: []
    },
    
    initialize: function (opts) {
        this.setOptions(opts);
    },
    
    addEntry: function (entry) {
        console.log(entry);
    }
});

var FileListEntry = new Class({
    
    initialize: function (values) {
        this.columns = {};
        if (values) this.setValues(values);
    },
    
    setValue: function (key, value) {
        if (typeof value == 'undefined')
            return;
        if (typeof value == 'string' && !value.length)
            return;
        this.columns[key] = value;
    },
    
    setValues: function (obj) {
        var self = this;
        Object.each(obj, function(key, value) {
            self.setValue(key, value);
        });
    }
    
});

// reflect the current sort method
(function (data) {
    if (!data['data-sort']) return;
    var split = data['data-sort'].split('');
    var sort = split[0], order = split[1];
    var char = order == '+' ? 'caret-up' : 'caret-down';
    var th = $$('th[data-sort="' + sort + '"] a')[0];
    if (th) th.innerHTML +=
        ' <i class="fa fa-' + char +
        '" style="padding-left: 3px; width: 1em;"></i>';
})(adminifier.currentData);

function fileSearch (text) {
    $$('table.file-list tbody tr').each(function (tr) {
        var matchingColumns = 0;
        if (text == '')
            matchingColumns++;
        else tr.getElements('td').each(function (td) {
            if (td.innerText.match(new RegExp(text, 'i')))
                matchingColumns++;
        });
        tr.setStyle('display', matchingColumns ? 'table-row' : 'none');
    });
}

function imageModeToggle() {
    alert('Switching modes');
}
