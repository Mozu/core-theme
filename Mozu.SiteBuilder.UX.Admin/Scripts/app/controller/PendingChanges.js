/**
 * @class Taco.controller.PendingChanges
 * @author james zetlen
 * The Products controller
 */

Ext.define('Taco.controller.PendingChanges', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.pendingchange.Cms', 'Taco.view.pendingchange.Catalog'],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.CmsDocumentDraft'],
    stores: ['Taco.store.CmsDocumentDrafts'],
    views: ['pendingchange.Cms'],
    modelName: 'Pending Change',


    index: function () {
        Taco.core.StateManager.attemptNavigate('pendingchanges/cms');
    },

    cms: function () {
        this.createContentView('Taco.view.pendingchange.Cms');
    },

    catalog: function() {
        this.createContentView('Taco.view.pendingchange.Catalog');
    }
});