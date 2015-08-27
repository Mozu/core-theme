Ext.define('Taco.controller.Capability', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.capability.Index',
        'Taco.view.capability.Edit'
    ],
    models: ['Taco.model.Capability'],
    stores: ['Taco.store.Capability'],
    views: ['capability.Index'],
    modelName: 'Capability',
    editorView: 'Taco.view.capability.Edit'
});