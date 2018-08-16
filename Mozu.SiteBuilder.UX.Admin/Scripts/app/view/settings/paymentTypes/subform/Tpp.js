Ext.define('Taco.view.settings.paymentTypes.subform.Tpp', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    margin: "0 0 0 0",
    cascadeChildTasks: true,
    title: 'External',
    margin: "0 0 0 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        this.title = this.externalPayment.get('name');
        var externalGateway = Ext.clone(this.record.get('externalPaymentWorkflows'));        
        var gatewayType = this.externalPayment.get('name').toUpperCase();
        var me = this;
        
        me.paymentGatewaysStore = Ext.create('Taco.store.PaymentGateways');
        me.paymentGatewaysStore.load({
            scope: me
        })

        me.cardGateways = me.record.get('cardGatewayMap');

        me.cardGatewayStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.CardGateway',
            autoLoad: false,
            remoteSort: false,
            remoteFilter: false,
            data: me.cardGateways
        });
      
        me.cardGatewayStore.filter('cardType', this.title);

        me.cardGatewayMap = [];
        me.syncCardGatewayMap = function () {
            var raw = Ext.Array.pluck(me.cardGatewayStore.data.items, 'data');
            me.cardGatewayMap = raw;
        };

        me.cardGateways = me.record.get('cardGatewayMap');
        
        var isEnabled = false;

        this.items = [];

        Ext.each(externalGateway, function (item) {
            if (gatewayType == item['name'].toUpperCase()) {
                isEnabled = item['isEnabled'];
            }
        });

        this.typeCheck = Ext.widget({
            xtype: 'checkbox',
            boxLabel: this.title,
            checked: isEnabled,
            id: this.externalPayment.get('name'),
            handler: this.onEnableChange,
            scope: this
        });

        var orderProcessingField = Ext.widget({
            xtype: 'radiogroup',
            fieldLabel: 'Order Processing',
            // Arrange radio buttons into two columns, distributed vertically
            columns: 1,
            vertical: true,
            items: [
                { boxLabel: 'Authorize And Capture On Order Placement', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeAndCaptureOnOrderPlacement', disabled: me.record.get('isMultiShipToEnabled') },
                { boxLabel: 'Authorize On Order Placement And Capture On Order Shipment', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' },
            ]
        });

        this.credPanel = Ext.widget({
            xtype: 'panel',
            hidden: !isEnabled,
            items:[{
                xtype: 'combobox',
                fieldLabel:'Primary Gateway',
                store:me.paymentGatewaysStore
            },{
                xtype: 'combobox',
                fieldLabel:'Secondary Gateway',
                store:me.paymentGatewaysStore
            },orderProcessingField]
        });

        this.items.push(this.typeCheck);
        this.items.push(this.credPanel);
    },

    onEnableChange: function() {
        if (this.typeCheck.getRawValue()) {
            this.credPanel.show();
        }else {
            this.credPanel.hide();
        }
    },
})