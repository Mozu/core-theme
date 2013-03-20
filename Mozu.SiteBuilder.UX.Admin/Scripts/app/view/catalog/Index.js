/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.ComboFilter'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {

        // list all products
        var store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products'
        });

        var list = Ext.create('Ext.view.BoundList', {
            store: store,
            itemSelector: 'x-boundlist-item',
            displayField: 'productName',
            valueField: 'productCode',
            disableSelection: true
        });

        // create a filter field

        var box = Ext.create('Taco.core.ux.ComboFilter', {
            store: ['zero'],
            margin: '20 0'
        });

        Ext.apply(this.body, {
            items: [box, list]
        });

        this.callParent(arguments);

        store.load({
            callback: function (records) { console.log(records); }
        });

    }
});