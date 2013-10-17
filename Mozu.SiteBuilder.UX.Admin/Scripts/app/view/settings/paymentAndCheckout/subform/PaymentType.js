/**
 * @class Taco.view.settings.paymentAndCheckout.subform.PaymentType
 *
 */

Ext.define('Taco.view.settings.paymentAndCheckout.subform.PaymentType', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.settings.paymentAndCheckout.Gateway'],
    title: 'Payment Types',
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };
        
        this.externalGateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions');
        this.gateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.GatewayDefinitions');
        this.gateWayDefinitionsCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Select a payment gateway',
            store: this.gateWayDefinitionsStore,
            queryMode: 'local',
            width: 400,
            forceSelection:true,
            name: 'gatewayDefinitionId',
            value: this.record.get('gatewayDefinitionId'),
            displayField: 'name',
            triggerOnClick:true,
            valueField: 'id'
        });
        this.gateWayContainer = Ext.widget({
            xtype: 'container',
            padding: '10 5 10 5',
            margin: '10,10,10,10'
        });

        this.externalGatewayContainer = Ext.widget({
            xtype: 'container',
            padding: '10 5 10 5',
            margin: '10,10,10,10'
        });


        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            items: [
                this.gateWayDefinitionsCombo,
                this.gateWayContainer,
                this.externalGatewayContainer,
                {
                    xtype: 'checkbox',
                    name: 'payByMail',
                    fieldLabel: 'Accept checks by mail'
                }

            ]
        });
        
        this.items = [this.paymentTypes];

        this.callParent(arguments);

        this.gateWayDefinitionsCombo.on(
            {
                change: this.onPaymentTypesChange,
                scope: this
            });
        
        if (this.record.get('gatewayDefinitionId')) {
            this.on('boxready', this.onPaymentTypesChange, this);
        }
        this.on('boxready', this.initExternalGateway, this);
    },
    initExternalGateway: function () {
        this.externalGateWayDefinitionsStore.addListener('load', function() {
            var me = this.externalGateWayDefinitionsStore;
            me.each(function (externalPayment) {
                var panel = Ext.create('Taco.view.settings.paymentAndCheckout.ExternalGateway', {
                    record: this.record,
                    externalPayment: externalPayment
                });
                this.externalGatewayContainer.add(panel);
            }, this);
        }, this);
    },
    beforeSave:function () {
        var me = this;
        me.callParent(arguments);
        Ext.each(this.gateWayContainer.query('[form]'), function (subForm) {
            subForm.beforeSave();
        });
    },
    onPaymentTypesChange: function () {
        
        if (this.gateWayDefinitionsStore.isLoading()) {
            this.mon(this.gateWayDefinitionsStore, 'load', this.onPaymentTypesChange, this);
            return;
        }
        var gateWayDef = this.gateWayDefinitionsCombo.findRecordByValue(this.gateWayDefinitionsCombo.getValue());
        if (!gateWayDef) {
            return;
        }
        this.gateWayContainer.removeAll();

        this.gateWayContainer.add(
            Ext.create('Taco.view.settings.paymentAndCheckout.Gateway', {
                record: this.record,
                gatewayDefinition: gateWayDef
            })
        );
    }
});