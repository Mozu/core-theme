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

        this.callParent(arguments);

        this.buildView();

        this.on({
            boxready: this.handleBoxReady,
            scope: this
        });
    },

    buildView: function () {
        var tpl = new Ext.XTemplate(
                '<ul class="inline-view">',
                    '<tpl for=".">',
                        '<li class="taco-inline-selector-item">',
                            '{text}',
                        '</li>',
                    '</tpl>',
                '</ul>'
            );

        this.view = Ext.create('Ext.view.View', {
            itemId: 'dataview',
            itemSelector: 'li.taco-inline-selector-item',
            tpl: tpl,
            selectedItemCls: 'selected',
            store: this.store
        });

        this.add(this.view);
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

        if (this.highlighted) {
            this.view.getSelectionModel().select(selectedIndex);
        }

        this.view.on({
            select: function (view, record) {
                Ext.defer(function() {
                    this.fireEvent('select', this, record);
                }, 5, this);
            },
            scope: this
        });
    },

    highlight: function (val) {
        var el = this.getEl();

        if (!el) {
            return;
        }

        //el[val === false ? 'removeCls' : 'addCls']('highlight');
    }
});