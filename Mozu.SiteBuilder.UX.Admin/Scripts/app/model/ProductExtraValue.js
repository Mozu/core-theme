/**
* @class Taco.model.ProductExtra
* @author Chris Missal
*/

Ext.define('Taco.model.ProductExtraValue', {
    extend: 'Taco.core.data.Model',
    fields:
    [
        {
            name: 'value',
            type: 'string',
            useNull: true
        },
        {
            name: 'deltaWeight',
            type: 'float',
            defaultValue: 0
        },
        {
            name: 'quantity',
            type: 'int',
            defaultValue: 1
        }, {
            name: 'deltaPrice',
            type: 'float',
            defaultValue: 0
        }, {
            name: 'detail',
            type: 'auto',
            defaultValue: {},
            persist: false
        }, {
            name: 'isDefaulted',
            type: 'boolean',
            defaultValue: false
        },
        {
            naem: 'productName',
            type: 'string',
            persist: false,
            convert: function (v, record) {
                if (record.raw) {
                    return record.raw.value;
                }

                if (record.data) {
                    return record.data.value;
                }
                return undefined;
            }
        },
        {
            naem: 'price',
            type: 'float',
            persist: false

        },
        {
            naem: 'salePrice',
            type: 'float',
            persist: false

        }
    ],

    idProperty: 'value'
});