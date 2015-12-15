
Ext.define('Taco.core.ux.picker.Selector', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.pickerselector',

    requires: [
        'Taco.core.ux.LightTag',
        'Taco.core.ux.picker.SelectorFlyout'
    ],
    cls: 'taco-picker-selector',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    disableTrigger: false,
    disableSelection: false,
    defaultText: '',
    tagText: '',
    highlighted: false,
    callToActionText: '',

    value: null,

    store: null,

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.initStoreFromArray();
        }

        this.addEvents([
            'select'
        ]);

        if (this.highlighted && !this.disableSelection) {
            this.cls += ' highlight';
        }

        this.items = [{
            data: { text: this.defaultText },
            flex: 1,
            itemId: 'title',
            tpl: '<div class="title {cls}">{text}</div>',
            xtype: 'component'
        }, {
            hidden: !this.tagText,
            itemId: 'tag',
            text: this.tagText,
            xtype: 'taco.lighttag'
        }, {
            cls: 'trigger x-dropdown-trigger',
            itemId: 'trigger',
            hidden: this.disableTrigger || this.store.count() === 0,
            xtype: 'component'
        }, {
            callToActionText: this.callToActionText,
            itemId: 'flyout',
            store: this.store,
            excludeByValue: this.value,
            xtype: 'taco.selectorflyout'
        }];

        this.callParent(arguments);

        this.selectDefaultValue();

        this.title = this.down('#title');
        this.flyout = this.down('#flyout');
        this.trigger = this.down('#trigger');

        if (this.store && this.store.count() === 1 && this.trigger) {
            this.selected = this.store.getAt(0);
            this.trigger.hide();
        }

        if (this.selected) {
            this.updateTitle();
        }

        this.on({
            boxready: this.handleBoxReady,
            scope: this
        });
    },

    initStoreFromArray: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: ['value', 'text', 'showDot']
        });

        Ext.each(this.store, function (val) {
            store.add({
                value: val[0],
                text: val[1],
                showDot: val[2]
            });
        });

        this.store = store;
    },

    handleBoxReady: function () {
        var selectedIndex = this.store ? this.store.find('value', this.value) : null;
        this.getEl().on({
            click: function (e) {
                var record = this.store.findRecord('value', this.value);

                if (e.target.className.indexOf('trigger') > -1) {
                    return this.togglePicker();
                }

                if (this.disableSelection) {
                    return;
                }
                this.fireEvent('select', this, record);
            },
            scope: this
        });

        this.flyout.on({
            select: function (view, record) {
                if (this.disableSelection) {
                    this.fireEvent('change', this, record);
                } else {
                    this.fireEvent('select', this, record);
                }
            },
            scope: this
        });

        this.mon(Ext.getBody(), 'click', function (e) {
            if (e.target.className.indexOf('trigger') > -1) {
                return;
            }

            if (!this.flyout.isHidden()) {
                this.flyout.hide();
            }
        }, this);
    },

    togglePicker: function () {
        this.flyout[this.flyout.isHidden() ? 'show' :  'hide']();
    },

    selectDefaultValue: function () {
        this.selected = this.store ? this.store.findRecord('value', this.value) : null;
    },

    selectValue: function (value) {
        this.value = value;
        this.selectDefaultValue();
        this.updateTitle();
    },

    updateTitle: function () {
        this.title.update({
            cls: this.selected.get('showDot') ? 'show-dot' : '',
            text: this.selected.get('text')
        });
    },

    highlight: function (val) {
        var el = this.getEl();

        if (!el || this.disableSelection) {
            return;
        }

        el[val === false ? 'removeCls' : 'addCls']('highlight');
    }

});