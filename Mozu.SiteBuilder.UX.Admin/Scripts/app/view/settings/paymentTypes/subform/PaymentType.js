/**
 * @class Taco.view.settings.paymentTypes.subform.PaymentType
 *
 */

Ext.define('Taco.view.settings.paymentTypes.subform.PaymentType', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.settings.paymentTypes.subform.CreditCards',
        'Taco.view.settings.paymentTypes.subform.ExternalGateway',
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
        //this.externalGateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions');
                       
        this.externalGatewayContainer = Ext.widget({
            xtype: 'container',
            padding: '0 5 10 5',
            margin: '0,10,10,10'
        });


        this.paymentTypes = Ext.create('Ext.panel.Panel', {
            items: [
                //this.gateWayContainer,
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
    }
});