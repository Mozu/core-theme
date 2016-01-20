/**
 * @class  Taco.controller.PriceLists
 * The PriceLists controller.
 */
Ext.define('Taco.controller.PriceLists', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.PriceList'],
    stores: ['Taco.store.PriceLists'],
    views: ['Taco.view.priceList.Index', 'Taco.view.priceList.Grid'],
    modelName: 'PriceList'
    
    
});

