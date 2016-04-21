/**
 * @class Taco.model.PriceListEntryPrice
*/
Ext.define('Taco.model.PriceListEntryPrice', {
    extend: 'Taco.core.data.Model',
    idProperty: 'minQty',
    fields: [
        {
            name: 'minQty',
            type: 'int',
            defaultValue: 1
        }, {
            name: 'listPriceMode',
            type: 'string',
            defaultValue: 'Simple',
            convert: function(val, record) {
                return val === 'UseCatalog' ? false : true;
            }
        }, {
            name: 'listPrice',
            type: 'float',
            useNull: true
        },
        {
            name: 'salePriceMode',
            type: 'string',
            defaultValue: 'Simple',
            convert: function(val, record) {
                return val === 'UseCatalog' ? false : true;
            }
        },
        {
            name: "salePrice",
            type: "float",
            useNull: true
        }
    ],
    
    belongsTo: 'Taco.model.PriceListEntry'
    
});