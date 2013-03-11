/**
 * @class Taco.controller.ProductTypes
 * @author Jimmy Sanford
 * The Product Types controller
 */

Ext.define('Taco.controller.ProductTypes', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.productType.Edit'],
    listView: null,
    models: ['Taco.model.ProductType'],
    stores: ['Taco.store.ProductTypes'],
    views: ['productType.Index'],
    modelName: 'Taco.model.ProductType',

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