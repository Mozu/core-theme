/**
 * @class  Taco.controller.Merchandising
 * The Merchandising controller.
 */
Ext.define('Taco.controller.Merchandising', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.merchandising.Index'],
    editorView: 'Taco.view.merchandising.Index',
    views: ['merchandising.Index'],
    edit: function() {
        this.createContentView('Taco.view.merchandising.Index');
    },
    create: function() {
        this.createContentView('Taco.view.merchandising.Index');
    }
});
