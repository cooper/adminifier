var TokenList = new Class({
    
    initialize: function (items, opts) {
        
        // container element options
        var elOpts = { class: 'token-list' };
        if (opts)
            elOpts = Object.merge(elOpts, opts);
        
        // create the container
        this.container = new Element('div', elOpts);
        
        // add initial items
        if (items)
            items.each(this.addItem);
        
    },
    
    addItem: function (item) {
        var el   = new Element('div', { class: 'token-list-item'   }),
            but  = new Element('div', { class: 'token-list-delete' }),
            span = new Element('span');
        
        // show/hide delete
        el.addEvents({
            mouseenter: function () {
                but.setStyle('display', 'block');
            },
            mouseleave: function () {
                but.setStyle('display', 'none');
            }
        });
        
        // delete
        but.addEvent('click', function () {
            el.destroy();
        });

        span.setProperty('text', item);
        this.container.appendChild(but);
        this.container.appendChild(span);
    },
    
    getItems: function () {
        return this.children.map(function (i) {
            return i.getProperty('text');
        });
    },
    
    // this allows $(tokenField)
    toElement: function () {
        return this.container;
    }
    
});