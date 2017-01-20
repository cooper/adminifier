var ModalWindow = new Class({

    initialize: function (opts) {

        // fixed shaded region, modal window, padded content region, header
        this.container   = new Element('div',  { class: 'modal-container'   });
        this.modalWindow = new Element('div',  { class: 'modal-window'      });
        this.content     = new Element('div',  { class: 'modal-content'     });
        this.header      = new Element('div',  { class: 'modal-header'      });
        this.doneButton  = new Element('span', { class: 'modal-done-button' });
        this.container.adopt(this.modalWindow);
        this.modalWindow.adopt(this.content);
        this.header.adopt(this.doneButton);
        this.content.adopt(this.header);

        // initial options
        if (typeof opts.title != 'undefined')
            this.setTitle(opts.title);
        if (typeof opts.icon != 'undefined')
            this.setIcon(opts.icon);
        if (typeof opts.doneText != 'undefined')
            this.setDoneText(opts.doneText);

        return this;
    },

    setTitle: function (title) {
        this.header.innerText = title;
    },

    setIcon: function (iconName) {

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
