Ext.define('Taco.view.customers.subform.CustomerAttribute', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Customer Attribute',
    cls: Taco.baseCSSPrefix + 'customer-notes',
    initComponent: function () {
        this.items = [{
            xtype: 'textfield',
            minLength: 3,
            name: 'productName',
            emptyText: 'Customer Attribute Robots',
            width: '100%'
        }];

        this.callParent(arguments);
    }
});