/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.settings.paymentTypes.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.settings.paymentTypes.Form'
    ],
    formCls: 'Taco.view.settings.paymentTypes.Form',
    enableSearchBarInHeader: false,
    cancelButtonEnabled: false,

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    // I don't know if there is a better way to do this ..
    // but the store has to be loaded first .. otherwise the externalpaymentgateways don't show.
    
    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                externalGateWayDefinitionsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions'),
                paymentGatewaysStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.PaymentGateways')
            });

            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.settings.paymentTypes.Edit', cfg));
                },
                tasks: [{
                    storeToLoad: cfg.externalGateWayDefinitionsStore
                }, {
                    storeToLoad: cfg.paymentGatewaysStore
                }],
                autoExecute: true,
            });

        }
    }
});