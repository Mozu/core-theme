/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Provisioning', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.provisioning.Index'],
  
    modelName: 'Product'

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