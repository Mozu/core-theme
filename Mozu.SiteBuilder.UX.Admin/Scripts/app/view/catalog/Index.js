/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.model.ItemFilter', 'Taco.core.ux.ComboFilter'],

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

        var filterStore = Ext.create('Ext.data.Store', {
            fields: ['property', 'value'],
            data: []
        });

        var box = Ext.create('Taco.core.ux.ComboFilter', {
            width: 675,
            margin: '20 0',
            itemStore: store
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