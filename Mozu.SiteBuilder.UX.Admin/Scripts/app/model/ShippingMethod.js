/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.ShippingMethod', {
    extend: 'Taco.core.data.Model',
   
    idProperty: 'shippingMethodCode',
    fields: [{
        name: 'shippingMethodCode',
            type: 'string'
        }, {
            name: 'shippingMethodName',
            type: 'string'
        }, {
            name: 'price',
            type: 'number'
        }]
});