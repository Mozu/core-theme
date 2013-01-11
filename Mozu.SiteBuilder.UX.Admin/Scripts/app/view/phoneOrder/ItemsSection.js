/**
 * @class Taco.view.phoneOrder.ItemsSection
 * @author James Zetlen
 */
Ext.define('Taco.view.phoneOrder.ItemsSection', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.simplegrid.Grid'],
    title: 'Cart',
    tbar: [
        {
            xtype: 'textfield',
            fieldLabel: 'SKU',
            name: 'sku'
        },
        {
            xtype: 'button',
            text: 'Add',
            disabled: true
        },
        {
            xtype: 'button',
            text: 'Configure',
            disabled: true
        },
        {
            xtype: 'button',
            text: 'Search'
        },
        '->',
        {
            xtype: 'button',
            text: 'Clear'
        }
    ],
    initComponent: function () {
        var me = this;
        Ext.define('fakeProduct', {
            extend: 'Ext.data.Model',
            fields: ['fakeName']
        });


        var fakeProductStore = Ext.create('Ext.data.Store', {
            model: 'fakeProduct',
            data: [
                { fakeName: 'one' },
                { fakeName: 'two' },
                { fakeName: 'three' }
            ]
        });
        this.items = [{
            xtype: 'simplegrid',
            // store: Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.OrderItems', clearFilters: true, clearSort: true }),
            store: fakeProductStore,
            columns: [{
                dataIndex: 'fakeName',
                text: 'Product',
                editable: false
            }]
        }];

        this.callParent(arguments);
    }
});