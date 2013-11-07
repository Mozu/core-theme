;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        editor;

    editor = {
        _dragging: false,

        init: function() {

            this.$hintBar = $('<div class="mz-cms-hint-bar" style="display:none"><div class="mz-cms-hint-message"></div></div>').appendTo('body');

            $doc.on({
                mousemove: $.proxy(this._onMousemove, this)
            });

            $('.mz-cms-grid').mzGrid();
            $('.mz-cms-widget').mzWidget(); 
        },

        dragging: function(val) {
            if (typeof val !== 'undefined') this._dragging = val;
            return this._dragging;
        },

        startDrag: function(widgetCfg) {
            if (widgetCfg && widgetCfg.type && widgetCfg.type() === 'block') {
                widgetCfg = {
                    block: widgetCfg
                };
            }
            this.widgetCfg = widgetCfg || {};
            $('.mz-cms-grid').addClass('mz-cms-droppable');
            this.dragging(true);
            this.cursor('move');
        },

        stopDrag: function() {
            $('.mz-cms-grid').removeClass('mz-cms-droppable');
            this.cursor('auto');
            this.dragging(false);
            this.$hintBar.css({
                display: 'none',
                left: -1000,
                top: -1000
            });
        },

        target: function(target) {
            if (!target.hint) return;
            this._target = target;
        },

        clearTarget: function(target) {
            // Only clear if a new target has NOT been set up yet
            if (this._target !== target) return;

            this._target = null;
        },

        showDropZones: function() {
            $('.mz-cms-grid').addClass('mz-cms-show-zone');
        },

        hideDropZones: function() {
            $('.mz-cms-grid').removeClass('mz-cms-show-zone');
        },

        drop: function() {
            var target = this._hintTarget,
                quadrant = this._hintQuadrant;

            this.stopDrag();

            // Make sure there is a target and a quadrant
            if (target && quadrant && target.insert) {
                target.insert(quadrant, this.widgetCfg);
            }

            this._hintQuadrant = null;
            this._hintTarget = null;
        },

        _onMousemove: function(e, ui) {
            var x,
                y,
                data;

            // On track when tragging
            if (!this.dragging()) return;

            //  Only fire if tracking a target
            if (!this._target) return;

            x = $doc.scrollLeft() + e.clientX;
            y = $doc.scrollTop() + e.clientY;

            data = this._target.hint(x, y);

            this.hint(data)
        },

        hint: function(data) {
            var height = 3,
                width = 3,
                x = data.left - 1,
                y = data.top - 1;

            // If showing the same hint in the same location, abort hinting
            if (this._hintTarget === data.target && this._hintQuadrant === data.quadrant) return;

            this._hintTarget = data.target;
            this._hintQuadrant = data.quadrant;

            switch (data.quadrant) {
                case 'top':
                    width = data.width + 1;
                    break;

                case 'right':
                    height = data.height + 2;
                    x += data.width;
                    break;

                case 'bottom':
                    width = data.width + 1;
                    y += data.height;
                    break;

                case 'left':
                    height = data.height + 2;
                    break;
            }

            this.$hintBar.css({
                left: x,
                top: y,
                height: height,
                width: width,
                display: 'block'
            }).removeClass('mz-cms-upright')
              .find('.mz-cms-hint-message')
              .html(data.message);


            if (data.quadrant === 'left' || data.quadrant === 'right') {
                this.$hintBar.addClass('mz-cms-upright');
            }

        },

        cursor: function(val) {
            if (val !== 'auto') val += ' important!';
            $('body').css('cursor', val);
        }
    };

    $doc.ready(function() {
        if (!win.Chorizo) win.Chorizo = {};
        Chorizo.editor = editor;
        editor.init();
    });

}(jQuery, window, document));