/**
 * @class  Taco.view.discount.Edit
 */

Ext.define('Taco.view.discount.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.discount.Form'
    ],
    formCls: 'Taco.view.discount.Form',
    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),

                shippingZonesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingZones')
            });
          
            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.discount.Edit', cfg));
                },
                tasks: [
                    {
                        storeToLoad: cfg.shippingMethodsStore
                    },
                    {
                        storeToLoad: cfg.shippingZonesStore
                    }
                ],
                autoExecute: true,
            });
        }
    },
});