;
(function($, win, doc) {
    'use strict';

    var Widget,
        widgets;

    widgets = {
        _modalTpl: [
            '<div>',
                '<div class="mz-cms-widget-modal" style="display:none">',
                    '<div class="mz-cms-header">',
                        'Widgets',
                    '</div>',
                    '<div class="mz-cms-body"></div>',
                '</div>',
                '<div class="mz-cms-shadow"></div>',
                '<div class="mz-cms-cover"></div>',
            '</div>'
        ],

        _widgetTpl: [
            '<div class="mz-cms-widget">',
                '<div class="mz-cms-icon"></div>',
                '<div class="mz-cms-label"></div>',
            '</div>'
        ],

        init: function() {
            var me = this;

            this.element = $(this._modalTpl.join('')).appendTo('body');

            this.$modal = this.element.find('.mz-cms-widget-modal');



            this.$body = this.$modal.find('.mz-cms-body');

            this.controller().findWidgetTypeDefinitions( window, function(widgets) {
                

                $.each(widgets, function(i, widget) {
                    me.$body.append(me.buildWidget(widget));
                });

                $('.mz-cms-widget').mzWidget();
            }, this);
        },
        
        controller: function() {
            return Chorizo.editor.controller();
        },

        buildWidget: function(cfg) {
            return $(this._widgetTpl.join(''))
                .data('definition', cfg)
                .find('.mz-cms-icon')
                    .css('background-image', 'url(' + cfg.icon + ')')
                .end()
                .find('.mz-cms-label')
                    .html(cfg.name)
                .end();
        },

        show: function() {
            this.$modal.show();
        },

        hide: function() {
            this.$modal.hide();
        },

        toggle: function() {
            this.$modal.toggle();
        }
    };

    Widget = function(element, options) {
        var me = this;

        this.options = $.extend({}, options);
        this.element = $(element);

        this.element
            .addClass('mz-cms-draggable')
            .draggable({
                cursor: 'move',
                distance: 20,
                cursorAt: {
                    top: 15,
                    left: 15
                },
                helper: function() {
                    return $('<div>');
                },
                start: function() {
                    Chorizo.widgets.hide();
                    Chorizo.editor.startDrag(me.element.data('definition'));
                },
                stop: function() {
                    Chorizo.editor.stopDrag();
                },
                drop: function() {
                    Chorizo.editor.stopDrag();
                }
            });

    }

    Chorizo.classFactory(Widget, 'mozu.mzWidget');
    Chorizo.widgets = widgets;


}(jQuery, window, document));