/**
 * @class Taco.view.phoneOrder.CartSection
 * @author James Zetlen
 */
Ext.define('Taco.view.phoneOrder.CartSection', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.simplegrid.Grid'],
  
    title: 'Cart',

    initComponent: function () {
        var me = this;

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