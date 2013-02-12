/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Products', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.product.Edit'],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.Product'],
    stores: ['Taco.store.Products'],
    views: ['product.Index'],
    modelName: 'Product',


    index: function () {
        if (Taco.app.context.getCurrent().contextType == 't') {
            this.createContentView('Taco.core.ux.content.Container', {
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
        } else {
            this.createContentView('Taco.view.product.Index');
        }
    }

});