;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        bar;


    bar = {
        init: function(element) {
            this.element = $(element).addClass('mz-ed-format-bar');

            this.element.on('mousedown', $.proxy(this._onClick, this));

            return this;
        },

        show: function() {
            win.clearTimeout(this._hideTimeout);
            this.element
                //.css('width', this.element.width() / 2)
                .addClass('mz-ed-active');

        },

        hide: function() {
            var proxy = $.proxy(function() {this.element.removeClass('mz-ed-active')}, this);
            this._hideTimeout = win.setTimeout(proxy, 150);
        },

        _onClick: function(e, ui) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var $item = $(e.target),
                role;

            if (!$item.is('[data-role]')) $item = $item.parents('[data-role]').first();

            role = $item.data('role');

            

            switch(role) {
                default:
                    console.log('doing command', role);
                    doc.execCommand(role, false, null);
                    break;
            }
        }
    };


    $doc.ready(function() {
        setTimeout(function() { $.mozu.formatter = bar.init('#formatBar'); }, 500);
    });

}(jQuery, window, document));