/**
 * @class Taco.view.phoneOrder.CartSection
 * @author James Zetlen
 */
Ext.define('Taco.view.phoneOrder.CartSection', {
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

        this.items = [
            {
                xtype: 'simplegrid',

        Ext.applyIf(this, {
            items: [{
                xtype: 'simplegrid',
                store: fakeProductStore,
                columns: [{
                    dataIndex: 'fakeName',
                    text: 'Product',
                    editable: false
                }]
            }]
        });

        this.callParent(arguments);
    }
});