/**
 * @class Taco.controller.ProductTypes
 * @author Jimmy Sanford
 * The Product Types controller
 */

Ext.define('Taco.controller.ProductTypes', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Producttypes'],
    requires:['Taco.view.productType.Edit'],
    listView: null,
    models: ['Taco.model.ProductType'],
    stores: ['Taco.store.ProductTypes', 'Taco.store.ProductTypesGrid', 'Taco.store.ProductTypesPicker'],
    views: ['productType.Index'],
    modelName: 'ProductType'
});