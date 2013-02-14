/**
 * @class Taco.controller.PendingChanges
 * @author james zetlen
 * The Products controller
 */

Ext.define('Taco.controller.PendingChanges', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.pendingchange.Cms'],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.CmsDocumentDirty'],
    stores: ['Taco.store.CmsDocumentsDirty'],
    views: ['pendingchange.Cms'],
    modelName: 'Pending Change',


    //index: function () {
    //    if (Taco.app.context.getCurrent().contextType == 't') {
    //        this.createContentView('Taco.core.ux.content.Container', {
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
    //    } else {
    //        this.createContentView('Taco.view.product.Index');
    //    }
    //}

    cms: function () {
        this.createContentView('Taco.view.pendingchange.Cms', {

        });
    }
});