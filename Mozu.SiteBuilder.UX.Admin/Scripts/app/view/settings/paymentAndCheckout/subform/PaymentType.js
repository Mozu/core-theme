/**
 * @class Taco.view.settings.paymentAndCheckout.subform.PaymentType
 *
 */

Ext.define('Taco.view.settings.paymentAndCheckout.subform.PaymentType', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.view.settings.paymentAndCheckout.Gateway',
        'Taco.view.settings.paymentAndCheckout.ExternalGateway',
        'Taco.store.ExternalGatewayDefinitions',
        'Taco.store.GatewayDefinitions'],
    title: 'Payment Types',
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
        this.externalGateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions');

        this.gateWayDefinitionsCombo = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Select a payment gateway',
            store: this.gateWayDefinitionsStore,
            queryMode: 'local',
            width: 400,
            forceSelection: true,
            name: 'gatewayDefinitionId',
            value: this.record.get('gateway')['gatewayDefinitionId'],
            displayField: 'name',
            triggerOnClick: true,
            valueField: 'id'
        });
        this.gateWayContainer = Ext.widget({
            xtype: 'container',
            padding: '10 5 10 5',
            margin: '10,10,10,10'
        });

        this.externalGatewayContainer = Ext.widget({
            xtype: 'container',
            padding: '0 5 10 5',
            margin: '0,10,10,10'
        });


        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            items: [
                this.gateWayDefinitionsCombo,
                this.gateWayContainer,
                this.externalGatewayContainer,
                {
                    xtype: 'checkbox',
                    name: 'payByMail',
                    boxLabel: 'Accept checks by mail'
                }

            ]
        });

        this.items = [this.paymentTypes];

        this.callParent(arguments);

        this.gateWayDefinitionsCombo.on({
            change: this.onPaymentTypesChange,
            scope: this
        });

        if (this.record.get('gateway')['gatewayDefinitionId']) {
            this.on('boxready', this.onPaymentTypesChange, this);
        }
        this.on('boxready', this.initExternalGateway, this);
    },
    initExternalGateway: function () {
        //runs this if it is loaded
        if (!this.externalGateWayDefinitionsStore.isLoading()) {
            this.buildExternalGateway();
        }
        //runs this if it hasn't loaded
        this.externalGateWayDefinitionsStore.addListener('load', this.buildExternalGateway, this);

    },
    buildExternalGateway: function () {
        var me = this.externalGateWayDefinitionsStore;
        me.each(function (externalPayment) {
            var panel = Ext.create('Taco.view.settings.paymentAndCheckout.ExternalGateway', {
                record: this.record,
                externalPayment: externalPayment
            });
            this.externalGatewayContainer.add(panel);
        }, this);
    },
    //beforeSave:function () {
    //    var me = this;
    //    me.callParent(arguments);
    //    Ext.each(this.gateWayContainer.query('[form]'), function (subForm) {
    //        subForm.beforeSave();
    //    });
    //},
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