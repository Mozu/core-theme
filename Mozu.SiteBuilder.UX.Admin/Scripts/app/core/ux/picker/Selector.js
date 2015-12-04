
Ext.define('Taco.core.ux.picker.Selector', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.pickerselector',

    requires: ['Taco.core.ux.LightTag'],
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

    value: null,

    store: null,

    initComponent: function () {

        if (Ext.isArray(this.store)) {
            this.initStoreFromArray();
        }

        this.addEvents([
            'select'
        ]);

        if (this.highlighted) {
            this.cls += ' highlight';
        }

        this.items = [{
            data: { text: this.defaultText },
            flex: 1,
            itemId: 'title',
            tpl: '<div class="title">{text}</div>',
            xtype: 'component'
        }, {
            itemId: 'tag',
            text: this.tagText,
            xtype: 'taco.lighttag'
        }, {
            cls: 'trigger',
            itemId: 'trigger',
            html: '+',
            hidden: this.disableTrigger,
            xtype: 'component'
        }];

        this.callParent(arguments);

        this.selectDefaultValue();

        this.title = this.down('#title');

        if (this.selected) {
            this.title.update({ text: this.selected.get('text') });
        }

        this.on({
            boxready: this.handleBoxReady,
            scope: this
        });
    },

    initStoreFromArray: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: ['value', 'text']
        });

        Ext.each(this.store, function (val) {
            store.add({
                value: val[0],
                text: val[1]
            });
        });

        this.store = store;
    },

    handleBoxReady: function () {
        var selectedIndex = this.store.find('value', this.value);
        this.getEl().on({
            click: function (e) {
                var record = this.store.findRecord('value', this.value);

                if (e.target.className.indexOf('trigger') > -1) {
                    return this.togglePicker();
                }
                this.fireEvent('select', this, record);
            },
            scope: this
        });
    },

    togglePicker: function () {
        console.log('toggle picker');
    },

    selectDefaultValue: function () {
        this.selected = this.store.findRecord('value', this.value);
    },

    highlight: function (val) {
        var el = this.getEl();

        if (!el) {
            return;
        }

        //el[val === false ? 'removeCls' : 'addCls']('highlight');
    }

});