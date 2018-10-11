/**
 * @class Taco.controller.B2BAttributes
 * The B2B attributes controller.
 */
Ext.define('Taco.controller.B2BAttributes', {
    extend: 'Taco.core.Controller',
    alias: 'Taco.controller.B2Battributes',
    modelName: 'CustomerAttribute',
    models: ['Taco.model.CustomerAttribute'],
    requires: ['Taco.view.b2bAttribute.Index', 'Taco.view.b2bAttribute.Edit'],
    views: ['b2bAttribute.Index'],
    modelName: 'CustomerAttribute',
    models: ['Taco.model.CustomerAttribute'],
    indexView: 'Taco.view.b2bAttribute.Index',
    editorView: 'Taco.view.b2bAttribute.Edit'
});