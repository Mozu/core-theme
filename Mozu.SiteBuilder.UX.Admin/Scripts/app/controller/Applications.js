/**
 * @class Taco.controller.Applications
 * @author Simeon Kessler
 * The Applications controller
 */

Ext.define('Taco.controller.Applications', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.application.Index'
    ],
    models: ['Taco.model.Application'],
    stores: ['Taco.store.Applications'],
    views: ['application.Index'],
    modelName: 'Application'
});