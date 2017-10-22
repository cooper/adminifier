// a.loadScript('pikaday');

var FileList = new Class({
    
    Implements: [Options, Events],
    
    options: {
        selection: true,    // allow rows to be selected
        columns: [],        // ordered list of column names
        columnData: {},     // object of column data, column names as keys
        // root         relative url for the list
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
            
            // skip if zero-length string
            if (typeof val == 'string' && !val.length)
                return;
            
            // convert date to object
            switch (self.getColumnData(col, 'dataType')) {
                case 'date':
                    val = new Date(parseInt(val) * 1000);
                    break;
            }
            
            // overwrite with transform
            entry.columns[col] = val;
            
            // if we made it to here, show the column
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
    
    redraw: function () {
        var container = this.container;
        
        // not drawn yet
        if (!container) {
            console.log('Cannot redraw() without previous draw()');
            return;
        }
        
        // destroy previous table
        this.container.getElement('.file-list').destroy();
        
        // re-draw
        delete this.container;
        this.draw(container);
    },
    
    // draw the table in the specified place
    draw: function (container) {
        var self = this;
        
        // already drawn
        if (self.container) {
            console.log('Cannot draw() file list again; use redraw()');
            return;
        }
        
        self.container = container;
        
        // if a filter is applied, filter
        var visibleEntries = self.entries;
        if (self.filter)
            visibleEntries = visibleEntries.filter(self.filter);
        
        // create table
        var table = self.table = new Element('table', { 'class': 'file-list' });
        table.store('file-list', self);
        
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
            if (sort) {
                th.set('data-sort', sort);
                var setSort = sort + '-';
                if (adminifier.currentData['data-sort'] == setSort)
                    setSort = sort + encodeURIComponent('+');
                anchor.set('href', self.options.root + '?sort=' + setSort);
            }
        });
        
        // TABLE BODY
        
        // checkbox column for table body
        var checkTd = new Element('td', { 'class': 'checkbox' });
        checkTd.appendChild(input.clone());
        
        // add each entry as a table row
        visibleEntries.each(function (entry) {
            
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
                
                // add states to title cell
                if (isTitle) entry.infoState.each(function (name) {
                    var span = new Element('span', {
                        text:   name,
                        class: 'file-info'
                    });
                    td.appendChild(span);
                });
                                
                // apply fixer
                var text  = entry.columns[col];
                var fixer = self.getColumnData(col, 'fixer');
                if (fixer) text = fixer(text);
                                
                // set text if it has length
                if (typeof text == 'string' && text.length)
                    textContainer.set('text', text);
                    
                // apply tooltip fixer
                var tooltip = entry.tooltips[col];
                fixer = self.getColumnData(col, 'tooltipFixer');
                if (fixer) tooltip = fixer(entry.columns[col]);
                    
                // tooltip
                if (typeof tooltip == 'string' && tooltip.length)
                    textContainer.set('title', tooltip);
                    
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
        this.columns    = {};
        this.tooltips   = {};
        this.infoState  = [];
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
    },
    
    setInfoState: function (name, state) {
        if (state && !this.infoState.contains(name))
            this.infoState.push(name);
        else
            this.infoState.erase(name);
    }
});

function fileSearch (text) {
    var list = document.getElement('.file-list');
    if (!list) return;
    list = list.retrieve('file-list');
    
    // no text; disable filter
    if (!text.length) {
        delete list.filter;
        list.redraw();
        return;
    }

    // set filter
    list.filter = function (entry) {
        var matched = 0;
        Object.values(entry.columns).each(function (val) {
            if (typeof val != 'string') {
                if (val.toString)
                    val = val.toString();
                else
                    return;
            }
            if (val.match(new RegExp(text, 'i')))
                matched++;
        });
        return !!matched;
    };

    // re-draw table
    list.redraw();
}

function dateToPreciseHR(d) {
    if (typeof d == 'string')
        d = new Date(parseInt(text) * 1000);
    return d.toString();
}

function dateToHRTimeAgo(time) {
    switch (typeof time) {
        case 'number':
            break;
        case 'string':
            time = +new Date(time);
            break;
        case 'object':
            if (time.constructor === Date)
                time = time.getTime();
            break;
        default:
            time = +new Date();
    }
    var time_formats = [
        [60,            'seconds',                          1           ],
        [120,           '1 minute ago', '1 minute from now'             ],
        [3600,          'minutes',                          60          ],
        [7200,          '1 hour ago', '1 hour from now'                 ],
        [86400,         'hours',                            3600        ],
        [172800,        'Yesterday', 'Tomorrow'                         ],
        [604800,        'days',                             86400       ],
        [1209600,       'Last week', 'Next week'                        ],
        [2419200,       'weeks',                            604800      ],
        [4838400,       'Last month', 'Next month'                      ],
        [29030400,      'months',                           2419200     ],
        [58060800,      'Last year', 'Next year'                        ],
        [2903040000,    'years',                            29030400    ],
        [5806080000,    'Last century', 'Next century'                  ],
        [58060800000,   'centuries',                        2903040000  ]
    ];
    var seconds = (+new Date() - time) / 1000,
        token = 'ago',
        list_choice = 1;
    if (seconds == 0)
        return 'Just now';
    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = 'from now';
        list_choice = 2;
    }
    var i = 0, format;
    while (format = time_formats[i++])
    if (seconds < format[0]) {
        if (typeof format[2] == 'string')
            return format[list_choice];
        else
            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
    return time;
}

function displayFilter () {
    var div = new Element('div', {
        class:  'filter-editor',
        html:   tmpl('tmpl-filter-editor', {})
    });
    document.body.adopt(div);
}
