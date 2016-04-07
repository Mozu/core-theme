/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.paymentGateways.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.paymentGateways.subform.PaymentGateway'
    ],
    formCls: 'Taco.view.settings.paymentGateways.subform.PaymentGateway',
    enableSearchBarInHeader: false,
    indexRoute: 'settings/paymentgateways',
    editorRoute: 'settings/paymentgatewaysedit',

    getIndexRoute: function () {
        return this.indexRoute;
    },

    getEditRoute: function () {
        return this.editorRoute;
    },
    
    initComponent: function () {
        var me = this;

        this.parentTitleCfg = {
            title: 'Payment Gateways',
            controller: this.indexRoute
        };

        me.callParent(arguments);
    }

});