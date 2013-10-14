/**
 * @class Taco.controller.FulfillmentTypes
 * @author Simeon Kessler
 * The Locations controller
 */

Ext.define('Taco.controller.FulfillmentTypes', {
    extend: 'Taco.core.Controller',
    requires: [
        //'Taco.view.locationType.Edit'
    ],
    //editorView: 'Taco.view.locationType.Edit',
    //listView: null,
    models: ['Taco.model.FulfillmentType'],
    stores: ['Taco.store.FulfillmentTypes'],
    views: ['fulfillmentType.Index'],
    modelName: 'FulfillmentType'
});