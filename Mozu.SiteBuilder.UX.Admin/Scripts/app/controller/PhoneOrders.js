/**
 * @class Taco.controller.PhoneOrders
 * The Phone Orders controller.
 */
Ext.define('Taco.controller.PhoneOrders', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Order',
    models: ['Taco.model.Order'],
    requires: ['Taco.view.phoneOrder.Index'],
    views: ['phoneOrder.Index'],

    index: function (params) {
        window.poModel = Ext.create('Taco.model.Order');
        this.createContentView('Taco.view.phoneOrder.Index', {
            record: window.poModel
        });
    }
});
