/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.model.ItemFilter', 'Taco.core.ux.ComboFilter', 'Taco.core.ux.grid.Panel'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {

        // list all products
        var store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products'
        });

        var list = Ext.create('Taco.core.ux.grid.Panel', {
            store: store,
            columns: [{
                flex: 1,
                text: 'Name',
                dataIndex: 'productName'
            }, {
                flex: 1,
                text: 'Price',
                dataIndex: 'price'
            }]
        });

        // create a filter field

        var box = Ext.create('Taco.core.ux.ComboFilter', {
            width: 675,
            margin: '20 0',
            itemStore: store,
            filterProperties: [{
                property: 'productName',
                text: 'Name',
                isDefault: true
            }, {
                property: 'price',
                text: 'Price',
                isDefault: false
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

        store.load({
            callback: function (records) { console.log(records); }
        });

    }
});