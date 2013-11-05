;
(function($, win, doc) {
    'use strict';

    var $doc = $(doc),
        statePrefix = 'mz-cms-state-',
        possibleStates,
        controller,
        Content,
        Text,
        Img;



    possibleStates = [
        'default',
        'editing',
        'selected',
        'moving'
    ];

    controller = {
        init: function() {
            $doc.on('click', $.proxy(this._onClick, this));
            this._items = [];
        },

        register: function(element, selector, test, action) {
            this._items.push({
                element: element,
                selector: selector,
                test: test,
                action: action
            });
        },

        _onClick: function(e, ui) {
            var $tar;
            $.each(this._items, function(i, item) {
                if (!item.test()) return;
                $tar = $(e.target);
                if ($tar.is(item.selector) || !$tar.parents(item.selector).length) item.action();
            })
        }
    }

    /**
     * CONTENT Class Definition
     */
    Content = function(element, options) {
        this.options = $.extend({}, Content.DEFAULTS, options);
        this.element = $(element);

        this.state('default');

        this.$content = this.element.find('.mz-cms-content');

        if (!this.options.isRichText) this.element.addClass('mz-cms-drag-handle');
    }

    Content.DEFAULTS = {};

    /**
     * Binds the appropriate EVENT map, will change the state
     * based on the previous state
     * @param  {object} map Event map
     * Sample Map:  {
     *                  'click': 'default > editing',
     *                  'blur .mz-cms-content': 'editing selected > default'
     *                  'clickaway .editor': '* > default'
     *              }
     */
    Content.prototype.on = function(map) {
        var me = this;

        $.each(map, function(event, states) {
            var stateSplit = states.split('>'),
                from = stateSplit[0].trim(),
                to = stateSplit[1].trim(),
                eventSplit = event.split(' '),
                eventName = eventSplit[0],
                selector = eventSplit[1],
                fromAnyEvent = from === '*';

            switch(eventName) {
                case 'clickaway':
                    controller.register(me.element, selector, function() {
                        return (fromAnyEvent || from.indexOf(me.state()) > -1);
                    }, function() {
                        me.state(to);
                    });
                    break;

                default: 
                    me.element.on(eventName, selector, function() {
                        if (fromAnyEvent || from.indexOf(me.state()) > -1) me.state(to);
                    });
                    break;
            }
            if (eventName === 'clickaway') {
                
            } else {
                
            }
        });
    }

    Content.prototype.state = function(state) {
        return (state) ? this._setState(state) : this._getState();
    }

    Content.prototype._getState = function() {
        var state;

        if (this._state) state = this._state;
        else if (this.element.hasClass(statePrefix + 'default')) state = 'default';
        else if (this.element.hasClass(statePrefix + 'editing')) state = 'editing';
        else if (this.element.hasClass(statePrefix + 'selected')) state = 'selected';
        else if (this.element.hasClass(statePrefix + 'moving')) state = 'moving';

        this._state = state;

        return state;
    }

    Content.prototype._setState = function(state) {
        this.element.removeClass(statePrefix + possibleStates.join(' ' + statePrefix));

        if (this['_' + state + 'State']) this['_' + state + 'State']();

        this.element.addClass(statePrefix + state);
        this._state = state;
    }


    /**
     * TEXT class definition
     */
    Text = function(element, options) {
        Content.call(this, element, options);

        this.element
            .attr('data-rich-text', 'true')
            .append($('<div class="mz-cms-drag-handle mz-cms-text-drag-handle"></div>'));

        this.on({
            'click': 'default > editing',
            'blur .mz-cms-content': 'editing > default'
        });
    }

    Text.prototype = new Content();

    Text.prototype._defaultState = function() {
        $.mozu.formatter.hide();
        this.$content.removeAttr('contenteditable');
    }

    Text.prototype._editingState = function() {
        $.mozu.formatter.show();
        this.$content.attr('contenteditable', 'true');
        this.$content.focus();
    }

    Text.prototype._movingState = function() {

    }


    /**
     * IMG class definition
     */
    Img = function(element, options) {
        Content.call(this, element, options);

        this.on({
            'click': 'default > selected',
            //'clickaway .mz-cms-selected': 'selected > default',
            'dblclick': 'default > editing',
            'blur': 'editing > default'
        });

        this.$resizer = $('<div class="mz-cms-resizer"><div class="mz-cms-bottom"></div></div>')
            .appendTo(this.element);

        this.$bottom = this.$resizer.find('.mz-cms-bottom')
            .draggable({
                helper: function() {
                    return $('<div>');
                },
                start: $.proxy(this._onStart, this),
                stop: $.proxy(this._onStop, this)
            });

        this.$img = this.element.find('.image-cover');
    }

    Img.prototype = new Content();

    Img.prototype._defaultState = function() {
        console.log('default');
    }

    Img.prototype._editingState = function() {
        console.log('editing');
    }

    Img.prototype._movingState = function() {

    }

    Img.prototype._onStart = function(e, ui) {
        this._moveHandler = $.proxy(this._onMousemove, this);
        this.offset = this.$img.offset();
        this.height = this.$img.height();

        $doc.on('mousemove', this._moveHandler);
        $.mozu.editor.stopDrag();
        $.mozu.editor.cursor('ns-resize');
    }

    Img.prototype._onStop = function(e, ui) {
        $doc.off('mousemove', this._moveHandler);
        $.mozu.editor.cursor('auto');
    }

    Img.prototype._onMousemove = function(e, ui) {
        this.$img.height($doc.scrollTop() + e.clientY - this.offset.top);
    }


    //  Plugin definitions
    $.mozu.classFactory(Text, 'mozu.mzText');
    $.mozu.classFactory(Img, 'mozu.mzImg');
    $.mozu.classFactory(Content, 'mozu.mzContent');

    $doc.ready(function() {
        controller.init();
    })

}(jQuery, window, document));