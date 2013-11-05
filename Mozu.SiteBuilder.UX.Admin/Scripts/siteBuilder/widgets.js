;
(function($, win, doc) {
    'use strict';

    var Widget;

    Widget = function(element, options) {
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
                    $.mozu.editor.startDrag();
                },
                stop: function() {
                    $.mozu.editor.stopDrag();
                },
                drop: function() {
                    $.mozu.editor.stopDrag();
                }
            });

    }

    $.mozu.classFactory(Widget, 'mozu.mzWidget');



}(jQuery, window, document));