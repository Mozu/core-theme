/**
 * @class Taco.model.PriceListEntryExtra
*/
Ext.define('Taco.model.PriceListEntryExtra', {
    extend: 'Taco.core.data.Model',
    idProperty: 'minQty',
    fields: [
        {
            name: 'attributeFqn',
            type: 'string'
        }, {
            name: 'attributeCode',
            type: 'string'
        }, {
            name: 'attributeName',
            type: 'string'
        }, {
            name: 'value',
            type: 'string'
        }, {
            name: 'stringValue',
            type: 'string'
        }, {
            name: 'deltaPrice',
            type: 'float',
            useNull: true
        }
    ],

    belongsTo: 'Taco.model.PriceListEntry'

});