/**
* @class Taco.model.ShippingRate
* @author Jason Cochran
*/

Ext.define('Taco.model.ShippingRate', {
    extend: 'Taco.core.data.Model',
    idProperty: 'shippingRateId',
    fields: [{
        name: 'shippingRateId',
        type: 'int',
        isHidden: true
    }, {
        name: 'content',
        type: 'auto',
        isHidden: true
    }, {
        name: 'flatPerCartShippingRate',
        type: 'auto',
        isHidden: true
    }, {
        name: 'flatPerItemShippingRate',
        type: 'auto',
        isHidden: true
    }, {
        name: 'isActive',
        type: 'boolean',
        isHidden: true
    }, {
        name: 'isInternational',
        type: 'boolean',
        isHidden: true
    }, {
        name: 'shippingClassId',
        type: 'int',
        isHidden: true
    }]
});