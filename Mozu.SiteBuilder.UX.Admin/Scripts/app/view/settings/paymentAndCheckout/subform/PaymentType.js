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

        this.gateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.GatewayDefinitions');
        this.gateWayDefinitionsCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Select a payment gateway',
            store: this.gateWayDefinitionsStore,
            queryMode: 'local',
            width: 400,
            name: 'gatewayDefinitionId',
            value: this.record.get('gatewayDefinitionId'),
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
            margin: '10,10,10,10'
        });
        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            items: [
                this.gateWayDefinitionsCombo,
                this.gateWayContainer,
                {
                    xtype: 'checkbox',
                    name: 'payByMail',
                    fieldLabel: 'Allow pay by mail'
                }

            ]
        });
        
        this.items = [this.paymentTypes];

        this.callParent(arguments);
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