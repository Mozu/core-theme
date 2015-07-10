/**
 * @class Taco.controller.Publish
 * @author bun crumps
 * The Publish controller
 */

Ext.define('Taco.controller.Publishing', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.publishing.Index',
        'Taco.view.publishing.Split'
    ],
    models: ['Taco.model.PublishSet'],
    indexView: 'Taco.view.publishing.Split',

    split: function(cfg) {
        this.createContentView('Taco.view.publishing.Split');
    }
});