/**
 * @class  Taco.controller.StoreFrontProducts
 * The StoreFrontProducts controller.
 */
Ext.define('Taco.controller.StoreFrontProducts', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.StorefrontProduct'],
    stores: ['Taco.store.StorefrontProducts'],
    modelName: 'StoreFrontProduct' 
});

