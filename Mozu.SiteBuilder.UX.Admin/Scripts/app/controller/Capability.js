Ext.define('Taco.controller.Capability', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.application.Index'
    ],
    models: ['Taco.model.Capability'],
    stores: ['Taco.store.Capability'],
    views: ['application.Index'],
    modelName: 'Capability'
});