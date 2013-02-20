/**
 * @class Taco.controller.Products
 * @author Travis Johnson
 * The Products controller
 */

Ext.define('Taco.controller.Attributes', {
    extend: 'Taco.core.Controller',
    listView: null,
    models: ['Taco.model.Attribute'],
    stores: ['Taco.store.Attributes'],
    views: ['attribute.Index'],
    modelName: 'Attribute',

    contextPlaceholders: {
        t: function () {
            return Ext.create('Taco.core.ux.content.Container', {
                header: {
                    title: "choose a site collection"
                },

                body: {
                    layout: 'auto',
                    items: [{
                        html: 'placeholder for choose site collection interstitial '
                    }]
                }
            });
        }
    }
});