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
    padding: '0 0 20 0',
    //margin: '10,0,10,10',

    header: null,

    initComponent: function() {
        this.header = null;
        var credFieldDefs = this.gatewayDefinition.get('credentialDefinitions'),
            credentials = this.record.get('credentials') || {},
            supportedCards = this.record.get('supportedCards') || [],
            supportedCardsDef = this.gatewayDefinition.get('supportedCards') || [],
            supportedCardsCbs = [],
            credentialsSet = this.record.get('credentialsSet');
        this.items = [];
        this.credFields = [];
        Ext.Array.each(credFieldDefs, function(fieldDef) {
            var credField = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: fieldDef.displayName,
                    name: fieldDef.name,
                    inputType: 'password',
                    value: credentialsSet && this.gatewayDefinition.getId() === this.record.get('gatewayDefinitionId') ? '        ' : ''
                });
            this.credFields.push(credField);
            this.items.push(credField);
        }, this);


        Ext.Array.each(supportedCardsDef, function (card) {
            supportedCardsCbs.push(
                { boxLabel: card.Value, name: 'cards', inputValue: card.Key, checked: supportedCards.indexOf(card.Key) > -1 }
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
        this.items.push(this.supportedCardsCbg, this.paymentProcessingFlowTypeRg);

        this.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    addChildSaveTasks: function (tasks) {
        var me = this;
        tasks.add({
            key:'credentials-update-record',
            fn:
                function (task) {
                    var isDirty = false, val = {};
                    Ext.each(me.credFields, function (field) {
                        if (field.isDirty()) {
                            isDirty = true;
                        }
                        val[field.name] = field.getValue();
                    });
                    if (isDirty) {
                        me.record.set('credentials', val);
                    }
                    me.record.set('supportedCards', me.supportedCardsCbg.getValue().cards);
                    
                    task.callback();
                },
            dependencies: 'update-record'
        });
        return tasks;
    }
    

});