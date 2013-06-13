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
        
        this.paymentTypesCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Select a payment gateway',
            store: Taco.core.data.StoreManager.getOrCreate('Taco.store.GatewayDefinitions'),
            queryMode: 'local',
            width:400,
            displayField: 'name',
            valueField: 'id',
            listners: {
                change: this.onPaymentTypesChange,
                scope:this
                
            }
            
        });
        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            title: 'Payment Types',
            items: [
                this.paymentTypesCombo,
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
                    fieldLabel: 'Order Processing',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Authorize And Capture On Order Placement', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeAndCaptureOnOrderPlacement' },
                        { boxLabel: 'Authorize On Order Placement And Capture On Order Shipment', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' },
                        { boxLabel: 'Authorize And Capture On Order Shipment', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeAndCaptureOnOrderShipment' }
                    
                    ]
                },
                
        
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Customer Checkout',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Guest Checkout with optional sign in', name: 'customerCheckoutType', inputValue: 'LoginOptional' },
                        { boxLabel: 'Sign in required', name: 'customerCheckoutType', inputValue: 'LoginRequired' },
                    
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
    },
    onPaymentTypesChange:function(){
        
    }
});