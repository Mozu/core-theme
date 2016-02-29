/**
 * @class Taco.view.settings.paymentGateways.subform.PaymentGateway
 *
 */

Ext.define('Taco.view.settings.paymentGateways.subform.PaymentGateway', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.settings.paymentGateways.subform.Gateway',
        'Taco.store.GatewayDefinitions'
    ],
    title: 'Payment Gateways',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",
    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.gateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.GatewayDefinitions');

        this.gateWayDefinitionsCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Payment gateway',
            store: this.gateWayDefinitionsStore,
            queryMode: 'local',
            width: 400,
            forceSelection: true,
            name: 'gatewayDefinitionId',
            value: this.record.get('gatewayDefinitionId'),
            displayField: 'name',
            triggerOnClick: true,
            valueField: 'id',
            readOnly: this.record.get('id'),
            emptyText: 'Select a Payment Gateway Provider'
        });

        this.gateWayContainer = Ext.widget({
            xtype: 'container',
        });


        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            items: [
                this.gateWayDefinitionsCombo,
                this.gateWayContainer
            ]
        });

        this.items = [this.paymentTypes];

        this.callParent(arguments);

        this.gateWayDefinitionsCombo.on({
            change: this.onPaymentTypesChange,
            scope: this
        });

        if (this.record.get('gatewayDefinitionId')) {
            this.on('boxready', this.onPaymentTypesChange, this);
        }
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
            Ext.create('Taco.view.settings.paymentGateways.subform.Gateway', {
                record: this.record,
                gatewayDefinition: gateWayDef
            })
        );
    }
});