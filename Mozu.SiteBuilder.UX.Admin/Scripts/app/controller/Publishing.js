/**
 * @class Taco.controller.Publish
 * @author bun crumps
 * The Publish controller
 */

Ext.define('Taco.controller.Publishing', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.publishing.Split',
        'Taco.view.publishing.Drafts'
    ],
    models: ['Taco.model.PublishSet'],
    indexView: 'Taco.view.publishing.Split',

    drafts: function(cfg) {
        var me = this;
        me.confirmContext('Taco.view.publishing.Drafts', function () {
            me.ensureRequiredStores(function () {
                me.createContentView('Taco.view.publishing.Drafts', cfg);
            });
        });
    },

    publishsets: function(cfg) {
        var me = this;
        me.confirmContext('Taco.view.publishing.Split', function () {
            me.ensureRequiredStores(function () {
                me.buildIndex(cfg);
            });
        });
    }
});