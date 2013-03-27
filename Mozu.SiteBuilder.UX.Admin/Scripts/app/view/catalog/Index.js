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

        var localStore = Ext.create('Ext.data.ArrayStore', {
            fields: ['food', 'tastiness'],
            data: [['cake', 7], ['pie', 8], ['brownies', 5], ['ice cream', 6], ['cookies', 10], ['pickles', 0]]
        });

        var list = Ext.create('Taco.core.ux.grid.Panel', {
            store: localStore,
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
                property: 'tastiness',
                text: 'Custom',
                isDefault: false,
                filterFn: function (item, filter) {
                    return item.get('food').indexOf(filter.value) > -1 || item.get('tastiness') > 7;
                }
            }, {
                property: 'food',
                text: 'Food',
                isDefault: true
            }]
        });

        var bar = Ext.create('Ext.toolbar.Toolbar', {
            items: [box, {
                xtype: 'tbtext',
                text: 'click me',
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: function () {
                            this.list.getStore().filter([{
                                property: 'food',
                                value: 'pi',
                                filterFn: function (item) {
                                    var isGood = item.get('tastiness') > 5;
                                    console.log(item, isGood); return isGood;
                                }
                            }]);
                        }
                    }
                }
            }]
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