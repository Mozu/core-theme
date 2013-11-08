;
(function($, win, doc) {
    'use strict';

    var Widget;

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



}(jQuery, window, document));