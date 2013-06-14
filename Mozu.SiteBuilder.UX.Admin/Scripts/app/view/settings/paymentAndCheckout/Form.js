/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentAndCheckout.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm',
    requires: ['Taco.view.settings.paymentAndCheckout.Gateway'],
    //layout: {
    //    type: 'vbox'
    //},
   
    initComponent: function() {
        this.gateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.GatewayDefinitions');
        this.gateWayDefinitionsCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Select a payment gateway',
            store: this.gateWayDefinitionsStore,
            queryMode: 'local',
            width: 400,
            name: 'gatewayDefinitionId',
            value:this.record.get('gatewayDefinitionId'),
            displayField: 'name',
            valueField: 'id',
            listeners: {
                change: this.onPaymentTypesChange,
                scope: this

                
            }
            
        });
        this.gateWayContainer = Ext.widget({
            xtype: 'container',
            padding: '10 5 10 5',
            margin:'10,10,10,10'
        });
        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            title: 'Payment Types',

            items: [
                this.gateWayDefinitionsCombo,
                this.gateWayContainer,
                {
                    xtype: 'checkbox',
                    name: 'payByMail',
                    fieldLabel:'Allow pay by mail'
                }
                
            ]
        });
        this.checkoutPrefrences = Ext.create('Ext.panel.Panel', {
            title: 'Chekcout Prefrences',
            height:200,
            padding: '10 5 10 5',
            
            margin: '10,10,10,10',
            items: [
               
                
        
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
                }
            ]
        });
        this.legalInformation = Ext.create('Ext.panel.Panel', {
            title: 'Legal Information',
            items: [
                {
                    html: '<div style="height:400px">tbd...</div>'
                }
            ]
        });
        
        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: [this.paymentTypes, this.checkoutPrefrences,this.legalInformation]
        });


        this.items = [this.paymentTypes, this.checkoutPrefrences, this.legalInformation];
        this.callParent(arguments);
        this.onPaymentTypesChange();
    },
    onPaymentTypesChange:function() {
        if (this.gateWayDefinitionsStore.isLoading()) {
            this.mon(this.gateWayDefinitionsStore, 'load', this.onPaymentTypesChange, this);
            return;
        }
        var gateWayDef = this.gateWayDefinitionsCombo.findRecordByValue(this.gateWayDefinitionsCombo.getValue());
        if ( !gateWayDef ){
            return;
        }
        this.gateWayContainer.removeAll();
            
        this.gateWayContainer.add(
            Ext.create('Taco.view.settings.paymentAndCheckout.Gateway', {
                record: this.record,
                gatewayDefinition:gateWayDef
            })
        );
    }
});