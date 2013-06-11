/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentAndCheckout.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm',
    requires: [],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function() {
        

        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            title: 'Payment Types',
            items: [
                {
                    html: '<div style="height:400px">...</div>'
                }
            ]
        });
        this.checkoutPrefrences = Ext.create('Ext.panel.Panel', {
            title: 'Chekcout Prefrences',
            items: [
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Customer Checkout',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Guest Checkout with optional sign in', name: 'customerCheckoutType', inputValue: 'LoginOptional' },
                        { boxLabel: 'Sign in required', name: 'customerCheckoutType', inputValue: 'LoginRequired' }
                    ]
                },
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Request Email Address',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Default Yes', name: 'rb2', inputValue: 'LoginOptional' },
                        { boxLabel: 'Default No', name: 'rb2', inputValue: 'LoginRequired' },
                        { boxLabel: 'Hide', name: 'rb2', inputValue: 'LoginRequired' }
                    ]
                },
                {
                    html: '<div style="height:400px">...</div>'
                }
            ]
        });
        this.legalInformation = Ext.create('Ext.panel.Panel', {
            title: 'Legal Information',
            items: [
                {
                    html: '<div style="height:400px">...</div>'
                }
            ]
        });
        
        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: [this.paymentTypes, this.checkoutPrefrences,this.legalInformation]
        });


        this.items = [this.paymentTypes, this.checkoutPrefrences, this.legalInformation];
        this.callParent(arguments);
    }
});