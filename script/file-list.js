(function (a, exports) {

// a.loadScript('pikaday');
document.addEvent('pageUnloaded', pageUnloaded)

function pageUnloaded () {
    document.removeEvent('pageUnloaded', pageUnloaded);
    closeFilter();
}


var FileList = exports.FileList = new Class({
    
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
                if (a.currentData['data-sort'] == setSort)
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

        self.updateSortMethod(a.currentData['data-sort']);
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

var FileListEntry = exports.FileListEntry = new Class({
    
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

exports.fileSearch = fileSearch;
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

exports.dateToPreciseHR = dateToPreciseHR;
function dateToPreciseHR(d) {
    if (typeof d == 'string')
        d = new Date(parseInt(d) * 1000);
    return d.toString();
}

exports.dateToHRTimeAgo = dateToHRTimeAgo;
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
            return Math.floor(seconds / format[2]) +
            ' ' + format[1] + ' ' + token;
    }
    return time;
}

function filterResize () {
   $('content').setStyle('width', window.innerWidth -
       $('navigation-sidebar').offsetWidth - 250 + 'px');
}

exports.displayFilter = displayFilter;
function displayFilter () {
    
    // if filter is already displayed, close it
    if (document.getElement('.filter-editor')) {
        closeFilter();
        return;
    }
    
    // if quick search is being used, stop
    if ($('top-search').value.length) {
        alert('Cannot filter Quick Search results. Please clear your search.');
        $('top-search').select();
        return;
    }
    
    // TODO: warn that opening the filter will clear the current selection
    
    // make filter button active and disable search
    $('top-button-filter').addClass('active');
    $('top-search').set('disabled', true);
    
    // create filter editor
    var filterEditor = new Element('div', {
        class:  'filter-editor',
        html:   tmpl('tmpl-filter-editor', {})
    });
    
    // enable the filter
    var list = document.getElement('.file-list').retrieve('file-list');
    list.filter = filterFilter;
    
    // add each column
    list.options.columns.each(function (col) {
        var row = new Element('div', {
            class:      'filter-row',
            html:       tmpl('tmpl-filter-text', { column: col }),
            'data-col': col
        });
        
        // on click, show the inner part
        var inner = row.getElement('.filter-row-inner');
        var check = row.getElement('input[type=checkbox]');
        check.addEvent('change', function () {
            var d = check.checked ? 'block' : 'none';
            inner.setStyle('display', d);
            row.set('data-enabled', check.checked ? true : '');
            list.redraw();
        });
        
        var textInput = row.getElement('input[type=text]');
        var onEnterOrClick = function () {
            textInput.set('value', textInput.value.trim());
            
            // no length
            if (!textInput.value.length) {
                textInput.set('value', '');
                return;
            }
            
            // check if entry exists
            var maybeDuplicate = inner.getElements('.filter-item')
                .filter(function (item) {
                    return item.get('data-text') == textInput.value
                })[0];
                
            // it does, and it has the same mode
            if (maybeDuplicate && maybeDuplicate.get('data-mode') == mode) {
                textInput.set('value', '');
                return;
            }
            
            // it does, but the mode is different. overwrite with new mode
            else if (maybeDuplicate)
                maybeDuplicate.destroy();
            
            var mode = inner.getElements('input[type=radio]')
                .filter(function (rad) { return rad.checked })
                .get('data-mode');
                        
            var item = new Element('div', {
                class:  'filter-item',
                html:   tmpl('tmpl-filter-item', {
                    mode:   mode,
                    item:   textInput.value
                }),
                'data-mode': mode,
                'data-text': textInput.value
            });
            
            // on delete button click, delete
            item.getElement('i[class~="fa-minus-circle"]').addEvent('click',
            function () {
                item.destroy();
                list.redraw();
            });
            
            // add the item
            inner.appendChild(item);
            textInput.set('value', '');
            
            list.redraw();
        };
        
        // on enter or click, add item
        textInput.onEnter(onEnterOrClick);
        inner.getElement('i[class~="fa-plus-circle"]').addEvent('click',
            onEnterOrClick);
        
        filterEditor.appendChild(row);
    });
    
    // add each info state
    list.entries.map(function (e) {
        return e.infoState
    }).flatten().unique().each(function (stateName) {
        var row = new Element('div', {
            class:  'filter-row',
            html:   tmpl('tmpl-filter-state', { stateName: stateName })
        });
        filterEditor.appendChild(row);
    });
    
    // resize content
    window.addEvent('resize', filterResize);
    filterResize();
    
    document.body.adopt(filterEditor);
}

function getFilterRules (row) {
    var inner = row.getElement('.filter-row-inner');
    return inner.getElements('.filter-item').map(function (item) {
        return [ item.get('data-mode'), item.get('data-text') ];
    });
}

function filterFilter (entry) {
    var filterEditor = document.getElement('.filter-editor');
    if (!filterEditor)
        return;
    var allFuncsMustPass = [];
    filterEditor.getElements('.filter-row').each(function (row) {
        var someFuncsMustPass = [];
        
        // row isn't enabled
        if (!row.get('data-enabled'))
            return;

        getFilterRules(row).each(function (rule) {
            
            // contains text
            if (rule[0] == "Contains")
                someFuncsMustPass.push(function (entry) {
                    return entry.columns[row.get('data-col')].toLowerCase()
                        .contains(rule[1].toLowerCase());
                });
            
            // equals text
            else if (rule[0] == "Is")
                someFuncsMustPass.push(function (entry) {
                    return entry.columns[row.get('data-col')].toLowerCase()
                        == rule[1].toLowerCase();
                });
            
            // only successful if one or more of someFuncsMustPass passes
            allFuncsMustPass.push(function (entry) {
                return someFuncsMustPass.some(function (func) {
                    return func(entry);
                });
            });
        });
    });
    
    // only successful if every allFuncsMustPass passes
    return allFuncsMustPass.every(function (func) {
        return func(entry);
    });
}

function closeFilter () {
    
    // filter not active
    if (!document.getElement('.filter-editor'))
        return;
        
    // release the filter button in the top bar
    if ($('top-button-filter'))
        $('top-button-filter').removeClass('active');
        
    // disable the filter
    var list = document.getElement('.file-list');
    if (list)
        delete list.filter;
        
    // destroy the editor
    document.getElement('.filter-editor').destroy();
    
    // undo our content size adjustments
    window.removeEvent('resize', filterResize);
    $('content').setStyle('width', 'auto');
    
    // re-enable QuickSearch
    if ($('top-search'))
        $('top-search').set('disabled', false);
}

})(adminifier, window);
