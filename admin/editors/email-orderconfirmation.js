Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Order Email',
    items: [
        {
            fieldLabel: 'Email Subject',
            xtype: 'textfield',
            name: 'subject'
        },
        {
            fieldLabel: 'Header html 1',
            xtype: 'taco-htmleditor',
            name: 'html_1'
        },
        {
            fieldLabel: 'Header html 2',
            xtype: 'taco-htmleditor',
            name: 'html_2'
        },
        {
            fieldLabel: 'Custom Field 1',
            xtype: 'textfield',
            name: 'custom1'
        }
    ]
});