/**
 * @class Taco.model.CustomShippingRate
 * 
 */

Ext.define('Taco.model.CustomShippingRate', {
    extend: 'Taco.core.data.Model',

    fields: [{
        'name': 'amount',
        'type': 'float'
    }, {
        'name': 'name',
        'type': 'string'
    }, {
        'name': 'type',
        'type': 'string',
        'defaultValue': 'FLAT_RATE_PER_ITEM_EXACT_AMOUNT'
    }, {
        'name': 'configuredCountries',
        'type': 'auto',
        'defaultValue': []
    }, {
        'name': 'isEnabled',
        'type': 'bool'
    }]
});
