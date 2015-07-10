/**
 * @class Taco.controller.PendingChanges
 * @author james zetlen
 * The Products controller
 */

Ext.define('Taco.controller.PendingChanges', {
    extend: 'Taco.core.Controller',
    alias:['Taco.controller.Pendingchanges'],
    requires: [
        'Taco.view.pendingChange.Publish',
        'Taco.view.pendingChange.Cms',
        'Taco.view.pendingChange.Product',
        'Taco.view.pendingChange.Split'
   ],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.CmsDocumentDraft', 'Taco.model.PublishSet'],
    stores: ['Taco.store.CmsDocumentDrafts', 'Taco.store.PublishSets'],
    views: [
        'pendingChange.Cms',
        'Taco.view.pendingChange.publishSet.Grid'
    ],
    modelName: 'Pending Change',

    index: function () {
        Taco.core.StateManager.attemptNavigate('pendingChanges/publish');
    },

    publish: function () {
        this.confirmContext('Taco.view.pendingChange.Publish', function () {
            this.createContentView('Taco.view.pendingChange.Publish');
        }, this);
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

    },

    split: function(cfg) {
        this.createContentView('Taco.view.pendingChange.Split');
    }
});