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


    index: function () {
        Taco.core.StateManager.attemptNavigate('pendingchanges/cms');
    },

    cms: function () {
        this.createContentView('Taco.view.pendingchange.Cms');
    }
});