/**
 * @class Taco.controller.Attributes
 * @author Travis Johnson
 * The Attributes controller
 */

Ext.define('Taco.controller.Attributes', {
    extend: 'Taco.core.Controller',
    //listView: null,
    models: ['Taco.model.Attribute'],
    stores: ['Taco.store.Attributes', 'Taco.store.AttributesGrid'],
    views: ['attribute.Index', 'attribute.Edit'],
    modelName: 'Attribute'
});