var FileList = new Class({
    
    Implements: [Options, Events],
    
    options: {
        columns: [],
        columnData: {}
    },
    
    initialize: function (opts) {
        this.entries = [];
        this.showColumns = {};
        this.setOptions(opts);
    },
    
    addEntry: function (entry) {
        var self = this;
        Object.each(entry.columns, function (val, col) {
            self.showColumns[col] = true;
        });
        this.entries.push(entry);
    },
    
    getVisibleColumns: function () {
        var self = this;
        return this.options.columns.filter(function (col) {
            return self.showColumns[col];
        });
    },
    
    getColumnData: function (col, key) {
        if (!this.options.columnData[col])
            return;
        if (typeof key != 'undefined')
            return this.options.columnData[col][key];
        return this.options.columnData[col];
    },
    
    draw: function (container) {
        var self = this;
        var table = new Element('table', { 'class': 'file-list' });
        
        // TABLE HEADING
        
        var thead = new Element('thead');
        var theadTr = new Element('tr');
        thead.appendChild(theadTr);
        table.appendChild(thead);
        
        // TODO: checkbox column
        this.getVisibleColumns().each(function (col) {
            
            // title
            var className = self.getColumnData(col, 'isTitle') ?
                'title' : 'info';
            var th = new Element('th', { 'class': className });
            var anchor = new Element('a', { text: col });
            th.appendChild(anchor);
            theadTr.appendChild(th);
            
            // sort method
            var sort = self.getColumnData(col, 'sort');
            if (sort) th.set('data-sort', sort);
        });
        
        container.appendChild(table);
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
        Object.each(obj, function(value, key) {
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
