!(function ($, win, doc) {
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
        init: function () {
            $doc.on('click', $.proxy(this._onClick, this));
            this._items = [];
        },

        register: function (element, selector, test, action) {
            this._items.push({
                element: element,
                selector: selector,
                test: test,
                action: action
            });
        },

        _onClick: function (e, ui) {


            var $tar;
            $.each(this._items, function (i, item) {
                if (!item.test()) return;

                $tar = $(e.target);
                if ((!$tar.is(item.selector) && !$tar.parents(item.selector).length) || $tar.parents(item.selector)[0] !== item.element[0]) item.action();
            })
        }
    }

    /**
     * CONTENT Class Definition
     */
    Content = function (element, options) {
        this.options = $.extend({}, Content.DEFAULTS, options);
        this.element = $(element);

        this.state('default');

        this.$content = this.element.find('.mz-cms-content');

        //if (!this.options.isRichText) this.element.addClass('mz-cms-drag-handle');

        this.element
            .append($('<ul class="mz-cms-tools"><li class="mz-cms-drag-handle"></li><li class="mz-cms-trash"></li></ul>'));

        this.$drag = this.element.find('.mz-cms-drag-handle')
            .html('<i class="fa fa-arrows fa-lg"></i>')
        this.$trash = this.element.find('.mz-cms-trash')
            .html('<i class="fa fa-trash-o fa-lg"></i>')
            .on('click', $.proxy(this.remove, this));
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
    Content.prototype.on = function (map) {
        var me = this;

        $.each(map, function (event, states) {
            var stateSplit = states.split('>'),
                from = stateSplit[0].trim(),
                to = stateSplit[1].trim(),
                eventSplit = event.split(' '),
                eventName = eventSplit[0],
                selector = eventSplit[1],
                fromAnyEvent = from === '*';

            switch (eventName) {
            case 'clickaway':
                controller.register(me.element, selector, function () {
                    return (fromAnyEvent || from.indexOf(me.state()) > -1);
                }, function () {
                    me.state(to);
                });
                break;

            default:
                me.element.on(eventName, selector, function () {
                    if (fromAnyEvent || from.indexOf(me.state()) > -1) me.state(to);
                });
                break;
            }
            if (eventName === 'clickaway') {

            } else {

            }
        });
    }

    Content.prototype.remove = function () {
        this.element.mzBlock('remove');
        Chorizo.formatter.hide();
    }

    Content.prototype.state = function (state) {
        return (state) ? this._setState(state) : this._getState();
    }

    Content.prototype.lastState = function () {
        return this._lastState;
    }

    Content.prototype._getState = function () {
        var state;

        if (this._state) state = this._state;
        else if (this.element.hasClass(statePrefix + 'default')) state = 'default';
        else if (this.element.hasClass(statePrefix + 'editing')) state = 'editing';
        else if (this.element.hasClass(statePrefix + 'selected')) state = 'selected';
        else if (this.element.hasClass(statePrefix + 'moving')) state = 'moving';

        this._state = state;

        return state;
    }

    Content.prototype._setState = function (state) {
        this._lastState = this.state();

        this.element.removeClass(statePrefix + possibleStates.join(' ' + statePrefix));

        if (this['_' + state + 'State']) this['_' + state + 'State']();

        this.element.addClass(statePrefix + state);
        this._state = state;


    }


    /**
     * TEXT class definition
     */
    Text = function (element, options) {
        Content.call(this, element, options);

        this.element
            .data('rich-text', true)
            .select($.proxy(this._onSelect, this));

        this.element.on({
            mouseup: $.proxy(this._onMouseup, this),
            click: $.proxy(this._onClick, this)
        });

        this.element.find('.mz-cms-content').on({
            blur: $.proxy(this._onBlur, this)
        });
    }

    Text.prototype = new Content();

    Text.prototype.editingUrl = function (val) {
        if (typeof val === 'undefined') return this._editingUrl;
        this._editingUrl = val;
        return this;
    }

    Text.prototype.focus = function () {
        this.element.find('[contenteditable]').focus();
    }

    Text.prototype._onMouseup = function (e) {
        if (Chorizo.editor.columnResizing()) return;
        if (this.state() === 'default') this.state('editing');
    }

    Text.prototype._onClick = function (e) {
        var $tar,
            oldUrl;

        if (this.state() !== 'editing') return;

        $tar = $(e.target);

        if (!$tar.is('a')) return;

        oldUrl = $tar.attr('href');
        $tar.attr('href', '#mz-cms-temp-link');

        Chorizo.formatter.showTooltip(oldUrl, $tar);
    }

    Text.prototype._onBlur = function (e) {
        if (this.editingUrl()) return;
        if (this.state() === 'editing') this.state('default');
    }

    Text.prototype._defaultState = function () {
        var widgetData = this.element.data('widget');

        Chorizo.formatter.hide();
        this.$content.removeAttr('contenteditable');

        widgetData.config = widgetData.config || {};

        if (this.lastState() === 'editing') {
            widgetData.config.body = this.$content.html();
            Chorizo.editor.dirtyStateCheck();
        }

        //widgetData.config.body = this.$content.html();
        //widgetData.config.body = this.element.children().html();
    }


    Text.prototype._editingState = function () {
        Chorizo.formatter.show(this);
        this.$content.attr('contenteditable', 'true');
        this.$content.focus();
    }

    Text.prototype._movingState = function () {

    }

    Text.prototype._onSelect = function (e) {

    }


    /**
     * IMG class definition
     */
    Img = function (element, options) {
        Content.call(this, element, options);

        this.on({
            'click': 'default editing > selected',
            'clickaway .mz-cms-state-selected': 'selected editing > default',
            'dblclick': '* > editing',
            'blur': 'editing > default'
        });

        this.$resizer = $('<div class="mz-cms-resizer"><div class="mz-cms-bottom"></div></div>')
            .appendTo(this.element);

        this.$bottom = this.$resizer.find('.mz-cms-bottom')
            .draggable({
                helper: function () {
                    return $('<div>');
                },
                start: $.proxy(this._onStart, this),
                stop: $.proxy(this._onStop, this)
            });

        this.widgetData = this.element.data('widget');

        if (!this.widgetData.config.heightResizable) this.$bottom.hide();
    }

    Img.prototype = new Content();

    Img.prototype._defaultState = function () {
        console.log('default');
    }

    Img.prototype._editingState = function () {
        console.log('editing');
        Chorizo.editor.edit(this.element.data('mozu.mzBlock'));
    }

    Img.prototype._movingState = function () {

    }

    Img.prototype._onStart = function (e, ui) {
        this._moveHandler = $.proxy(this._onMousemove, this);
        this.offset = this.$content.children().first().offset();
        this.height = this.$content.children().first().height();

        $doc.on('mousemove', this._moveHandler);
        Chorizo.editor.stopDrag();
        Chorizo.editor.cursor('ns-resize');
    }

    Img.prototype._onStop = function (e, ui) {
        $doc.off('mousemove', this._moveHandler);
        Chorizo.editor.cursor('auto');
        this.widgetData.config.height = this.$content.outerHeight();
        Chorizo.editor.dirtyStateCheck();
    }

    Img.prototype._onMousemove = function (e, ui) {
        var height = $doc.scrollTop() + e.clientY - this.offset.top;
        this.$content.height(height);
    }


    //  Plugin definitions
    Chorizo.classFactory(Text, 'mozu.mzText');
    Chorizo.classFactory(Img, 'mozu.mzImg');
    Chorizo.classFactory(Content, 'mozu.mzContent');

    $doc.ready(function () {
        controller.init();
    })

}(jQuery, window, document));