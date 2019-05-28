/**
 * @class  Taco.controller.Discounts
 * The Discounts controller.
 */
Ext.define('Taco.controller.Discounts', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.Discount'],
    requires: ['Taco.view.discount.Edit'],
    editorView: 'Taco.view.discount.Edit',
    views: ['discount.Index'],
    modelName: 'Discount',
});
