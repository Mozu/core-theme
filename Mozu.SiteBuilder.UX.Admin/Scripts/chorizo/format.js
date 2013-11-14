;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        bar;

    bar = {
        init: function() {
            this.element = $([
                '<div class="mz-cms-format-bar">',
                    '<ul>',
                        '<li class="mz-cms-styles">Styles</li>',
                        '<li data-role="bold"><i class="fa fa-bold"></i></li>',
                        '<li data-role="italic"><i class="fa fa-italic"></i></li>',
                        '<li data-role="underline"><i class="fa fa-underline"></i></li>',
                        '<li data-role="createLink"><i class="fa fa-link"></i></li>',
                        '<li data-role="unlink"><i class="fa fa-unlink"></i></li>',
                        '<li data-role="justifyLeft"><i class="fa fa-align-left"></i></li>',
                        '<li data-role="justifyCenter"><i class="fa fa-align-center"></i></li>',
                        '<li data-role="justifyRight"><i class="fa fa-align-right"></i></li>',
                        '<li data-role="insertUnorderedList"><i class="fa fa-list-ul"></i></li>',
                        '<li data-role="insertOrderedList"><i class="fa fa-list-ol"></i></li>',
                        '<li data-role="indent"><i class="fa fa-indent"></i></li>',
                        '<li data-role="outdent"><i class="fa fa-outdent"></i></li>',
                    '</ul>',
                '</div>'
            ].join(''));

            this.element
                .appendTo('body')
                .on('mousedown', $.proxy(this._onClick, this));


            this.$urlTooltip = $([
                '<div class="mz-cms-tooltip">',
                    '<input type="text" placeholder="http://">',
                '</div>'
            ].join('')).appendTo('body');

            this.$urlInput = this.$urlTooltip
                                    .find('input')
                                    .on({
                                        blur: $.proxy(this._onBlurUrl, this)
                                    });

            return this;
        },

        show: function(text) {
            win.clearTimeout(this._hideTimeout);
            this._text = text;
            this.element
                .addClass('mz-cms-active');

        },

        hide: function() {
            var proxy = $.proxy(function() {
                this.element.removeClass('mz-cms-active')
            }, this);
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

            switch (role) {
                case 'createLink':
                    this.createLink();
                    break;
                default:
                    console.log('doing command', role);
                    doc.execCommand(role, false, null);
                    break;
            }
        },

        _onBlurUrl: function(e, ui) {
            var url = this.$urlInput.val();
            this.$urlTooltip.hide();
            this._text.focus();
            $('[href="#mz-cms-temp-link"]').attr('href', url);
            this._text.editingUrl(false);
            
            if (this._range) this.range(this._range);
            
            delete this._range;
        },

        createLink: function() {
            this._range = this.range();
            this._text.editingUrl(true);
            doc.execCommand('createLink', false, '#mz-cms-temp-link');
            this.showTooltip();
        },

        showTooltip: function(url, posEl) {
            var $posEl

            this._text.editingUrl(true);

            if (!posEl) posEl = this._range.endContainer;

            $posEl = $(posEl);

            $posEl = $posEl[0].nodeName === '#text' 
                        ? $posEl.parent()
                        : $posEl;

            this.$urlInput.val(url || '');

            this.$urlTooltip
                    .show()
                    .position({
                        of: $posEl,
                        my: 'center top',
                        at: 'center bottom'
                    });
            
            this.$urlInput.focus();
        },

        range: function(cfg) {
            var range,
                selection;

            if (!cfg) {
                selection = win.getSelection();

                range = selection.getRangeAt();

                return {
                    container: range.commonAncestorContainer,
                    endContainer: range.endContainer,
                    endOffset: range.endOffset,
                    startContainer: range.startContainer,
                    startOffset: range.startOffset
                };
            }

            range = doc.createRange();

            range.selectNodeContents(cfg.container);
            range.setEnd(cfg.endContainer, cfg.endOffset);
            range.setStart(cfg.startContainer, cfg.startOffset);

            selection = win.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    win.Chorizo.formatter = bar;
    $doc.ready(function() {
        bar.init();
    });

}(jQuery, window, document));