/**
 * @class Taco.model.PriceListEntryExtra
*/
Ext.define('Taco.model.PriceListEntryExtra', {
    extend: 'Taco.core.data.Model',
    idProperty: 'compositeKey',
    fields: [
        {
            name: 'compositeKey',
            type: 'string',
            convert: function (v, record) {
                return {
                    attributeFqn: record.get('attributeFqn'),
                    attributeCode: record.get('attributeCode')
                };
            },
            persist: false
        },
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
        }, {
            name: 'catalogPrice',
            type: 'float',
            useNull: true
        }, {
            name: 'overridePrice',
            type: 'float',
            useNull: true
        }
    ],

    belongsTo: 'Taco.model.PriceListEntry'

});