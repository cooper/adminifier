var FileList = new Class({
    
    Implements: [Options, Events],
    
    options: {
        selection: true,    // allow rows to be selected
        columns: [],        // ordered list of column names
        columnData: {}      // object of column data, column names as keys
        // isTitle      true for the widest column
        // sort         sort letter
        // fixer        transformation to apply to text before displaying it
    },
    
    initialize: function (opts) {
        this.entries = [];
        this.showColumns = {};
        this.setOptions(opts);
    },
    
    // add an entry
    addEntry: function (entry) {
        var self = this;
        Object.each(entry.columns, function (val, col) {
            
            // apply fixer
            var fixer = self.getColumnData(col, 'fixer');
            if (fixer) val = fixer(val);
            entry.columns[col] = val;
            
            // skip if no length
            if (typeof val != 'string' || !val.length)
                return;
                
            // show the column
            self.showColumns[col] = true;
        });
        this.entries.push(entry);
    },
    
    // a list of visible column numbers
    getVisibleColumns: function () {
        var self = this;
        return this.options.columns.filter(function (col) {
            return self.showColumns[col];
        });
    },
    
    // getColumnData(column number, data key) returns value at that key
    // getColumnData(column number) returns entire object
    getColumnData: function (col, key) {
        if (!this.options.columnData[col])
            return;
        if (typeof key != 'undefined')
            return this.options.columnData[col][key];
        return this.options.columnData[col];
    },
    
    // draw the table in the specified place
    draw: function (container) {
        var self = this;
        var table = self.table = new Element('table', { 'class': 'file-list' });
        
        // TABLE HEADING
        
        var thead   = new Element('thead'),
            theadTr = new Element('tr'),
            tbody   = new Element('tbody');
        thead.appendChild(theadTr);
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // checkbox column for table head
        //<th class="checkbox"><input type="checkbox" value="0" /></th>
        var checkTh = new Element('th', { 'class': 'checkbox' });
        var input = new Element('input', { type: 'checkbox', value: '0' });
        checkTh.appendChild(input);
        if (self.options.selection)
            theadTr.appendChild(checkTh);
        
        // other columns
        self.getVisibleColumns().each(function (col) {
            
            // column is title?
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
        
        // checkbox column for table body
        var checkTd = new Element('td', { 'class': 'checkbox' });
        checkTd.appendChild(input.clone());
        
        // add each entry as a table row
        self.entries.each(function (entry) {
            
            // row may be cached
            var tr = entry.tr;
            if (tr) {
                tbody.appendChild(tr);
                return;
            }
            
            // have to create row
            tr = entry.tr = new Element('tr');
            
            // checkbox
            if (self.options.selection)
                tr.appendChild(checkTd.clone());
            
            // visible data columns
            self.getVisibleColumns().each(function (col) {
                
                // column is title?
                var isTitle   = self.getColumnData(col, 'isTitle');
                var className = isTitle ? 'title' : 'info';
                var td = new Element('td', { 'class': className });
                
                // anchor or span
                var textContainer;
                if (entry.link && isTitle)
                    textContainer = new Element('a', { href: entry.link });
                else
                    textContainer = new Element('span');
                td.appendChild(textContainer);
                
                // set text if it has length
                var text = entry.columns[col];
                if (typeof text == 'string' && text.length)
                    textContainer.set('text', text);
                    
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        self.updateSortMethod(adminifier.currentData['data-sort']);
        container.appendChild(table);
    },

    // reflect the current sort method
    updateSortMethod: function (sort) {
        var table = this.table;
            
        // destroy existing
        var existing = table.getElement('.sort-icon');
        if (existing)
            existing.destroy();
        
        // no sort specified
        if (!sort)
            return;
        
        var split = sort.split('');
        sort = split[0];
        var order = split[1];
        var char = order == '+' ? 'caret-up' : 'caret-down';
        var th = table.getElement('th[data-sort="' + sort + '"] a');
        if (th) th.innerHTML +=
            ' <i class="sort-icon fa fa-' + char +
            '" style="padding-left: 3px; width: 1em;"></i>';
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
