Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Custom Order Details',
    items: [
        {
            fieldLabel: 'Company name',
            xtype: 'textfield',
            name: 'companyName'
        },
        {
            fieldLabel: 'Physical Address',
            xtype: 'textarea',
            name: 'companyAddress'
        },
        {
            fieldLabel: 'Website Url',
            xtype: 'textfield',
            name: 'websiteUrl'
        }
    ]
});