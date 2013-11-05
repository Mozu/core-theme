Ext.define('Taco.controller.Capability', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.application.Index',
        'Taco.view.application.Edit'
    ],
    models: ['Taco.model.Capability'],
    stores: ['Taco.store.Capability'],
    views: ['application.Index'],
    modelName: 'Capability',
    editorView: 'Taco.view.application.Edit'
});