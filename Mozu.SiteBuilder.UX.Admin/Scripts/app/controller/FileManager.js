/**
* @class Taco.controller.FileManager
* The FileManager controller
*/

Ext.define('Taco.controller.FileManager', {
    extend: 'Taco.core.Controller',
    views: ['fileManager.Index'],
    modelName: 'file', //tbd

    requiresContextOfType: ['c', 's']
    //contextPlaceholders: {
    //    t: function () {
    //        return Ext.create('Taco.core.ux.content.Container', {
    //            header: {
    //                title: "choose a site collection"
    //            },

    //            body: {
    //                layout: 'auto',
    //                items: [{
    //                    html: 'placeholder for choose site collection interstitial'
    //                }]
    //            }
    //        });
    //    }
    //}
   
});