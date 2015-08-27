/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentAndCheckout.Gateway', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    //layout: {
    //    type: 'vbox'
      
    //},
    cascadeChildTasks: true,
    padding: '0 0 20 0',
    //margin: '10,0,10,10',

    header: null,
    //.get('gateway')['gatewayDefinitionId']
    initComponent: function () {
        this.header = null;
        var credFieldDefs = this.gatewayDefinition.get('credentialDefinitions'),
            credentials = this.record.get('gateway')['credentials'] || {},
            supportedCards = this.record.get('gateway')['supportedCards'] || [],
            supportedCardsDef = this.gatewayDefinition.get('supportedCards') || [],
            supportedCardsCbs = [],
            credentialsSet = this.record.get('gateway')['credentialsSet'];

        this.items = [];
        this.credFields = [];
        Ext.Array.each(credFieldDefs, function (fieldDef) {
            var credField = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: fieldDef.displayName,
                    name: fieldDef.name,
                    inputType: 'password',
                    value: credentialsSet && this.gatewayDefinition.getId() === this.record.get('gateway')['gatewayDefinitionId'] ? '        ' : ''
                });
            this.credFields.push(credField);
            //this.credFields.add(credField);
            this.items.push(credField);
        }, this);


        Ext.Array.each(supportedCardsDef, function (card) {
            supportedCardsCbs.push(
                { boxLabel: card.value, name: 'cards', inputValue: card.key, checked: supportedCards.indexOf(card.key) > -1 }
            );
        });


        this.supportedCardsCbg = Ext.widget({
            xtype: 'checkboxgroup',
            fieldLabel: 'Supported Cards',
            // Arrange checkboxes into two columns, distributed vertically
            columns: 2,
            vertical: true,
            items: supportedCardsCbs       
        });

        this.paymentProcessingFlowTypeRg = Ext.widget(
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
            });
        ;
        this.items.push(this.credFields, this.supportedCardsCbg, this.paymentProcessingFlowTypeRg);

        this.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    
    persistFormValues:function() {
        var me = this;
        var gateway = Ext.clone(me.record.get('gateway'));
        var hasCredentialsChanged = false, val = {};

        Ext.each(me.credFields, function (field) {
            if (field.isDirty()) {
                hasCredentialsChanged = true;
            }
            val[field.name] = field.getValue();
        });

        gateway.credentialsSet = hasCredentialsChanged;
        gateway.credentials = val;
        gateway.gatewayDefinitionId = this.gatewayDefinition.get('id');

        gateway.supportedCards = me.supportedCardsCbg.getValue().cards;

        if (gateway.supportedCards && typeof gateway.supportedCards === 'string') gateway.supportedCards = [gateway.supportedCards];

        //update this when ever there is a reason to turn off a gateway.
        gateway.isActive = true;


        me.record.set('gateway', gateway);
    }
    
});