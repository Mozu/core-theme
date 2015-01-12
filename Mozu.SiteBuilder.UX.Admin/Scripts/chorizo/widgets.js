;
(function($, win, doc) {
    'use strict';

    var Widget,
        widgets;

    widgets = {
        _modalTpl: [
            '<div>',
                '<div class="mz-cms-widget-modal hidden">',
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
        widgetIconDefinitions: {},

        init: function() {
            var me = this;

            this.element = $(this._modalTpl.join('')).appendTo('body');

            this.$modal = this.element.find('.mz-cms-widget-modal');

            this.element.find('.mz-cms-cover').on({
                click: function (e) {
                    Chorizo.widgets.hide();
                }
            });

            this.$body = this.$modal.find('.mz-cms-body');
           
            this.controller().findWidgetTypeDefinitions( window, function(widgets) {
                //somehow the callback might fire twice??? so clear out the existing widgets.
                me.$body.empty();

                $.each(widgets, function(i, widget) {
                    me.$body.append(me.buildWidget(widget));
                    me.widgetIconDefinitions[widget.id] = widget.icon;
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
                    .css('background-image', 'url(\'' + cfg.icon + '\')')
                .end()
                .find('.mz-cms-label')
                    .html(cfg.name)
                .end();
        },

        show: function() {
            this.$modal.show({
                duration: 0,
                start: function () {
                    $(this).toggleClass('hidden', false);
                }
            });
        },

        hide: function() {
            this.$modal.hide({
                duration: 0,
                start: function () {
                    $(this).toggleClass('hidden', true);
                }
            });
        },

        toggle: function() {
            this.$modal.toggle({
                duration: 0,
                start: function () {
                    $(this).toggleClass('hidden');
                }
            });
        },
        getDragIcon: function(img) {
            img = img.substring(0,3) === 'url' ? img : 'url(' + img + ')';
            return $( ['<div class="mz-drag-icon" style="background-image:', img, '; width: 50px; height:50px; background-repeat:round; position:absolute"></div>'].join('') );
        }
    };

    Widget = function(element, options) {
        var me = this,
            img = $(element).find('.mz-cms-icon').css('backgroundImage');

        this.options = $.extend({}, options);
        this.element = $(element);

        this.dragIcon = widgets.getDragIcon(img);

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
                    // $('body').css('cursor', img + ', auto');
                    Chorizo.widgets.hide();
                    Chorizo.editor.startDrag(me.element.data('definition'), me.dragIcon);
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