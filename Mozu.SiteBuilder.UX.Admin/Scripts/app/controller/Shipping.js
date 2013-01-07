/**
 * @class Taco.controller.Shipping
 * The Shipping controller.
 */
    Ext.define('Taco.controller.Shipping', {
        extend: 'Taco.core.Controller',
        modelName: 'Taco.model.ShippingRate',
        requires: ['Taco.view.shipping.Index'],
        views: ['shipping.Index'],

        index: function (params) {
            this.createContentView('Taco.view.shipping.Index');
            
        }
    });
