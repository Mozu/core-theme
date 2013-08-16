/**
 * @class Taco.model.Discount
 */
Ext.define('Taco.model.ShippingMethod', {
    extend: 'Taco.core.data.Model',
   
    idProperty: 'ShippingMethodCode',
    fields: [{
        name: 'ShippingMethodCode',
            type: 'string'
        }, {
            name: 'ShippingMethodName',
            type: 'string'
        }, {
            name: 'Price',
            type: 'number'
        }]
});