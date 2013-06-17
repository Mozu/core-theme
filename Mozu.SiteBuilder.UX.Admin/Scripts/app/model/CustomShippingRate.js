/**
 * @class Taco.model.CustomerGroup
 * A Taco.model.CustomerGroup is a way to 'tag' a Customer. These groups or tags have a unique ID.
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
        defaultValue: 'FLAT_RATE_PER_ITEM_EXACT_AMOUNT'
    }, {
        'name': 'isEnabled',
        'type': 'bool'
    }],

  
});
