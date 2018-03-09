/**
 * @class  Taco.controller.Discounts
 * The Discounts controller.
 */
Ext.define('Taco.controller.Discounts', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.Discount'],
    requires: ['Taco.view.discount.Edit'],
    editorView: 'Taco.view.discount.Edit',
    stores: ['Taco.store.Discounts', 'Taco.store.DiscountGrid'],
    views: ['discount.Index'],
    modelName: 'Discount'
    
    
});

