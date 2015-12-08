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
                autoEl: 'ul',
                cls: 'inline-view',
                itemId: 'list',
                items: this.inlineItems,
                xtype: 'container'
            }
        ];

        this.callParent(arguments);

        this.listView = this.down('#list');

        this.on({
            boxready: this.handleBoxReady,
            scope: this
        });
    },

    buildInlineItems: function () {
        var items = [];

        this.store.each(function (record) {
            var cls = 'taco-inline-selector-item';

            if (record.get('value') === this.value) {
                cls += ' selected';
            }

            items.push({
                autoEl: 'li',
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

    handleBoxReady: function () {
        // var selectedIndex = this.store.find('value', this.value);

        // if (this.highlighted) {
        //     this.view.getSelectionModel().select(selectedIndex);
        // }

        // this.view.on({
        //     select: function (view, record) {
        //         Ext.defer(function() {
        //             this.fireEvent('select', this, record);
        //         }, 5, this);
        //     },
        //     scope: this
        // });
    },

    highlight: function (val) {
        var el = this.getEl();

        if (!el) {
            return;
        }

        //el[val === false ? 'removeCls' : 'addCls']('highlight');
    }
});