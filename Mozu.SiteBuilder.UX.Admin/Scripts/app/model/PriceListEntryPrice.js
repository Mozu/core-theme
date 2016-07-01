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
            convert: function(val) {
                return val !== 'UseCatalog';
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
            convert: function(val) {
                return val !== 'UseCatalog';
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