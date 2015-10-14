/**
 * @class  Taco.controller.SearchTuningRules
 * The SearchTuningRules controller.
 */
Ext.define('Taco.controller.SearchTuningRules', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.SearchTuningRule'],
    stores: ['Taco.store.SearchTuningRules'], //'Taco.store.CouponSetGrid
    views: ['Taco.view.searchTuningRule.Index', 'Taco.view.searchTuningRule.Grid'],
    modelName: 'SearchTuningRule'
    
    
});

