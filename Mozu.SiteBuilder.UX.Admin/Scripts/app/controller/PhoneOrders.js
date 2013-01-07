/**
 * @class Taco.controller.PhoneOrders
 * The Phone Orders controller.
 */
Ext.define('Taco.controller.PhoneOrders', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.PhoneOrder',
    requires: ['Taco.view.phoneOrder.Index'],
    views: ['phoneOrder.Index'],

    index: function (params) {
        this.createContentView('Taco.view.phoneOrder.Index');
        
    }
});
