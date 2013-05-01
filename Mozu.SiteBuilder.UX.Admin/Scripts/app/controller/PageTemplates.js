/**
 * @class  Taco.controller.PageTemplates
 * The PageTemplates controller
 */

Ext.define('Taco.controller.PageTemplates', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.PageTypeDefinition'],
    //views: ['role.Index'],
    //stores: ['Taco.store.Roles'],
    requires: ['Taco.view.pageTemplate.Index'],
    modelName: 'PageTypeDefinition'
    //contextPlaceholders: {
    //    tc: function () {
    //        return Ext.create('Taco.core.ux.content.Container', {
    //            header: {
    //                title: "choose a site "
    //            },

    //            body: {
    //                layout: 'auto',
    //                items: [{
    //                    html: 'placeholder for choose site  interstitial '
    //                }]
    //            }
    //        });
    //    }
    //}
});