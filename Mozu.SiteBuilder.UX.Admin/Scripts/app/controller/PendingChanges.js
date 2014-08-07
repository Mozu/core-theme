/**
 * @class Taco.controller.PendingChanges
 * @author james zetlen
 * The Products controller
 */

Ext.define('Taco.controller.PendingChanges', {
    extend: 'Taco.core.Controller',
    alias:['Taco.controller.Pendingchanges'],
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
        Taco.core.StateManager.attemptNavigate('pendingChanges/cms');
    },

    cms: function () {
        
        this.confirmContext('Taco.view.pendingChange.Cms', function () {
            this.createContentView('Taco.view.pendingChange.Cms');
        }, this);
    },

    product: function () {
        this.confirmContext('Taco.view.pendingChange.Product', function () {
            this.createContentView('Taco.view.pendingChange.Product');
        }, this);

    }
});