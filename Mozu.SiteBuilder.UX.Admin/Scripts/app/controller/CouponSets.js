/**
 * @class  Taco.controller.CouponSets
 * The CouponSets controller.
 */
Ext.define('Taco.controller.CouponSets', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.CouponSet'],
    stores: ['Taco.store.CouponSets', 'Taco.store.CouponSetGrid'],
    views: ['Taco.view.couponSet.Index', 'Taco.view.couponSet.Grid'],
    modelName: 'CouponSet'
    
    
});

