Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Order Email',
    items: [
        {
            fieldLabel: 'Company name',
            xtype: 'textfield',
            name: 'companyName'
        },
        {
            fieldLabel: 'Physical Address',
            xtype: 'textarea',
            name: 'address'
        },
        {
            fieldLabel: 'Website Url',
            xtype: 'textfield',
            name: 'websiteUrl'
        }
    ]
});