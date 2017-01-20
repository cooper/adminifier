var ModalWindow = new Class({

    initialize: function (opts) {

        // fixed shaded region, modal window, padded content region, header
        this.container   = new Element('div',  { class: 'modal-container'   });
        this.modalWindow = new Element('div',  { class: 'modal-window'      });
        this.content     = new Element('div',  { class: 'modal-content'     });
        this.header      = new Element('div',  { class: 'modal-header'      });
        this.doneButton  = new Element('span', { class: 'modal-done-button' });
        this.header.adopt(this.doneButton);
        this.modalWindow.adopt(this.header, this.content);
        this.container.adopt(this.modalWindow);

        // initial options
        if (typeof opts.title != 'undefined')
            this.setTitle(opts.title);
        if (typeof opts.icon != 'undefined')
            this.setIcon(opts.icon);
        else
            this.setIcon('cog');
        if (typeof opts.doneText != 'undefined')
            this.setDoneText(opts.doneText);
        else
            this.setDoneText('Done');
        if (opts.padded)
            this.content.addClass('padded');

        return this;
    },

    setTitle: function (title) {
        var span = this.title;
        if (!span) {
            span = this.title = new Element('span');
            this.header.adopt(span);
        }
        span.innerText = title;
    },

    setIcon: function (iconName) {
        var icon = this.icon;
        if (!icon) {
            icon = this.icon = new Element('i');
            this.doneButton.inject(icon, 'after');
        }
        icon.className = 'fa fa-' + iconName;
    },

    setDoneText: function (text) {
        this.doneButton.innerText = text;
    },

    show: function (container) {
        if (!container)
            container = document.body;
        container.adopt(this.container);
        this.container.setStyle('display', 'block');
    },

    hide: function () {
        this.container.setStyle('display', 'none');
    }
});
