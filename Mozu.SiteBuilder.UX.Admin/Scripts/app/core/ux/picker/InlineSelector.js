Ext.define('Taco.core.ux.picker.InlineSelector', {
    extend: 'Ext.container.Container',
    alias: 'widget.taco.inlineselector',

    cls: 'taco-inline-selector',

    highlighted: false,

    value: null,

    requires: [
        'Ext.view.View'
    ],

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

        this.inlineItems = this.buildInlineItems();

        this.items = [{
                hidden: true,
                itemId: '',
                xtype: 'container'
            }, {
                cls: 'inline-view',
                itemId: 'list',
                items: this.inlineItems,
                xtype: 'container'
            }
        ];

        this.callParent(arguments);

        this.listView = this.down('#list');
    },

    buildInlineItems: function () {
        var items = [];

        this.store.each(function (record) {
            var cls = 'taco-inline-selector-item';

            if (record.get('value') === this.value) {
                cls += ' selected';
            }

            items.push({
                cls: cls,
                html: Ext.String.htmlEncode(record.get('text')),
                listeners: {
                    click: function () {
                        this.fireEvent('select', this, record);
                    },
                    element: 'el',
                    scope: this
                },
                xtype: 'component'
            });
        }, this);

        return items;
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

    highlight: function (val) {
        var el = this.getEl();

        if (!el) {
            return;
        }

        //el[val === false ? 'removeCls' : 'addCls']('highlight');
    }
});