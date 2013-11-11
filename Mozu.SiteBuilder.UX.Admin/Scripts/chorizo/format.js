;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        bar;


    bar = {
        init: function() {
            this.element = $(['<div id="formatBar" class="mz-cms-format-bar">',
                        '<ul>',
                            '<li class="mz-cms-styles">Styles</li>',
                            '<li data-role="bold"><i class="fa fa-bold"></i></li>',
                            '<li data-role="italic"><i class="fa fa-italic"></i></li>',
                            '<li data-role="underline"><i class="fa fa-underline"></i></li>',
                            '<li data-role="createLink"><i class="fa fa-link"></i></li>',
                            '<li data-role="justifyLeft"><i class="fa fa-align-left"></i></li>',
                            '<li data-role="justifyCenter"><i class="fa fa-align-center"></i></li>',
                            '<li data-role="justifyRight"><i class="fa fa-align-right"></i></li>',
                            '<li data-role="insertUnorderedList"><i class="fa fa-list-ul"></i></li>',
                            '<li data-role="insertOrderedList"><i class="fa fa-list-ol"></i></li>',
                            '<li data-role="indent"><i class="fa fa-indent"></i></li>',
                            '<li data-role="outdent"><i class="fa fa-outdent"></i></li>',
                        '</ul>',
                    '</div>'].join(''));

            this.element
                .appendTo('body')
                .on('mousedown', $.proxy(this._onClick, this));

            return this;
        },

        show: function() {
            win.clearTimeout(this._hideTimeout);
            this.element
                //.css('width', this.element.width() / 2)
                .addClass('mz-cms-active');

        },

        hide: function() {
            var proxy = $.proxy(function() {this.element.removeClass('mz-cms-active')}, this);
            if (!this.element.length) return;
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

    win.Chorizo.formatter = bar;
    $doc.ready(function() {
        bar.init();
    });

}(jQuery, window, document));