/**
 * @class  Taco.controller.ProductRankings
 * The ProductRankings controller.
 */
Ext.define('Taco.controller.ProductRankings', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.ProductRanking'],
    stores: ['Taco.store.ProductRankings'], //'Taco.store.CouponSetGrid
    views: ['Taco.view.productRanking.Index', 'Taco.view.productRanking.Grid'],
    modelName: 'ProductRanking'
    
    
});

