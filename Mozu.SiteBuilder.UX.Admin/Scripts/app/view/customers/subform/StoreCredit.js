Ext.define('Taco.view.customers.subform.StoreCredit', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Store Credit',
    cls: Taco.baseCSSPrefix + 'customer-notes',
    initComponent: function () {
        this.items = [{
            xtype: 'textfield',
            minLength: 3,
            name: 'productName',
            emptyText: 'Store Credit Robots',
            width: '100%'
        }];

        this.callParent(arguments);
    }
});