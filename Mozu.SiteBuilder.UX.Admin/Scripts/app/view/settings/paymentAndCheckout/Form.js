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
                },
                  {
                      xtype: 'radiogroup',
                      fieldLabel: 'Request customer email address for marketing purposes',
                      margin: '0 0 50 0',
                      // Arrange radio buttons into two columns, distributed vertically
                      columns: 1,
                      vertical: true,
                      items: [
                          { boxLabel: 'Checked (Yes) by default', name: 'kk', inputValue: 'LoginOptional' },
                          { boxLabel: 'Unchecked (No) by default', name: 'kk', inputValue: 'LoginRequired' },
                          { boxLabel: 'Disable and hide option', name: 'kk', inputValue: 'LoginRequired' }

                      ]
                  }
            ]
        });
        this.legalInformation = Ext.create('Ext.panel.Panel', {
            title: 'Legal Information',
            items: [
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Display links on checkout',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
                },
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Send in email order notiﬁcation',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
                },
                {
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Print on packing slip',
                    margin: '0 0 50 0',
                    // Arrange checkboxes into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Terms', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Privacy Policy', name: 'rb', inputValue: '2' },
                        { boxLabel: 'Return Policy', name: 'rb', inputValue: '3' }
                    ]
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