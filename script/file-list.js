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
        
        var thead   = new Element('thead'),
            theadTr = new Element('tr'),
            tbody   = new Element('tbody');
        thead.appendChild(theadTr);
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // checkbox column
        //<th class="checkbox"><input type="checkbox" value="0" /></th>
        var checkTh = new Element('th', { 'class': 'checkbox' });
        var input = new Element('input', { type: 'checkbox', value: '0' });
        checkTh.appendChild(input);
        theadTr.appendChild(checkTh);
        
        // other columns
        self.getVisibleColumns().each(function (col) {
            
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
        
        // TABLE BODY
        
        var checkTd = new Element('td', { 'class': 'checkbox' });
        checkTd.appendChild(input.clone());
        
        self.entries.each(function (entry) {
            var tr = new Element('tr');
            tr.appendChild(checkTd.clone());
            self.getVisibleColumns().each(function (col) {
                var className = self.getColumnData(col, 'isTitle') ?
                    'title' : 'info';
                var td = new Element('td', { 'class': className });
                var text = entry.columns[col];
                if (typeof text == 'string' && text.length)
                    td.set('text', text);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
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
