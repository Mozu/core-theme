/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.model.ItemFilter', 'Taco.core.ux.ComboFilter', 'Taco.core.ux.grid.Panel', 'Taco.core.ux.form.Form'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {

        // list all products
        var store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products'
        });

        var localStore = Ext.create('Ext.data.ArrayStore', {
            fields: ['food', 'tastiness'],
            data: [
                ['chocolate cake', 7], ['cherry pie', 8], ['brownies', 5], ['ice cream', 6], ['cookies', 10],
                ['pickles', 0], ['tapioca pudding', 2], ['pumpkin pie', 9], ['fruit cake', 1]
            ],
            sorters: [{ property: 'tastiness', root: 'data', direction: 'DESC' }]
        });

        var list = Ext.create('Taco.core.ux.grid.Panel', {
            store: localStore,
            emptyText: '<div>There are no results that matched your filter.</div>',
            columns: [{
                flex: 1,
                text: 'Food',
                dataIndex: 'food'
            }, {
                xtype: 'numbercolumn',
                flex: 1,
                text: 'Tastiness',
                dataIndex: 'tastiness',
                format: '0'
            }]
        });

        // create a filter field

        var box = Ext.create('Taco.core.ux.ComboFilter', {
            width: 675,
            margin: '20 0',
            itemStore: localStore,
            filterProperties: [{
                property: 'food',
                text: 'Food',
                isDefault: true
            }, {
                property: 'tastiness',
                text: 'Tasty',
                isDefault: false,
                filterFn: function (item, filter) { return item.get('tastiness') >= parseInt(filter.value); }
            }],
            editors: [{
                xtype: 'formflexbox',
                justify: false,
                items: [{
                    xtype: 'textfield',
                    name: 'food',
                    fieldLabel: 'Food',
                    width: 160
                }, {
                    xtype: 'textfield',
                    name: 'tastiness',
                    fieldLabel: 'Tastiness',
                    width: 160
                }]
            }]
        });

        var bar = Ext.create('Ext.toolbar.Toolbar', {
            items: [box]
        });

        Ext.apply(this.body, {
            layout: 'auto',
            items: [bar, list]
        });

        this.callParent(arguments);

        localStore.load();
        this.grocery = localStore;
        this.list = list;
        store.load({
            callback: function (records) { console.log(records); }
        });

    }
});