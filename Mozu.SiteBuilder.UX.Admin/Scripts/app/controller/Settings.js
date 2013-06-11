/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Settings', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.settings.paymentAndCheckout.Edit'],
    //editorView: 'Taco.view.product.Edit',
    listView: null,
    models: ['Taco.model.Product'],
    paymentAndCheckout: function () {
        
        Taco.model.PaymentAndCheckout.load(123, {
            success: function (record, o) {
                this.createContentView('Taco.view.settings.paymentAndCheckout.Edit', {
                    record: record

                });
               
            },
            failure: function () {
                console.error('PaymentAndCheckout', 'failure');
            },
            scope:this
        });
        

        
    }
    //stores: ['Taco.store.Products'],
    //views: ['product.Index'],
    //modelName: 'Product'

    //contextPlaceholders: {
    //    t: function () {
    //        return Ext.create('Taco.core.ux.content.Container', {
    //            header: {
    //                title: "choose a site collection"
    //            },

    //            body: {
    //                layout: 'auto',
    //                items: [{
    //                    html: 'placeholder for choose site collection interstitial '
    //                }]
    //            }
    //        });
    //    }
    //}
});