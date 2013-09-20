/**
 * @class Taco.controller.PendingChanges
 * @author james zetlen
 * The Products controller
 */

Ext.define('Taco.controller.PendingChanges', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.pendingChange.Cms',
        'Taco.view.pendingChange.Product'
   ],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.CmsDocumentDraft'],
    stores: ['Taco.store.CmsDocumentDrafts'],
    views: ['pendingChange.Cms'],
    modelName: 'Pending Change',

    index: function () {
        Taco.core.StateManager.attemptNavigate('pendingchanges/cms');
    },

    cms: function () {
        this.createContentView('Taco.view.pendingChange.Cms');
    },

    catalog: function() {
        this.createContentView('Taco.view.pendingChange.Product');
    }
});