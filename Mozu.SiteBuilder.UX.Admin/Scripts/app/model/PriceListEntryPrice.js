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

    //getDeletePromptMessage: function() {
    //    var msg = 'Are you sure you want to delete "' + this.get('name') + '"?';
    //    //if (this.get('pricingEntries').length > 1) {
    //    //    msg += '<br/>It will affect these categories: ' + this.get('categoryNamesJoined');
    //    //}
    //    return msg;
    //},

    belongsTo: 'Taco.model.PriceListEntry'

    //validations: [
    //    { field: 'currencyCode', type: 'length', max: 3 }
    //]

    //proxy: {
    //    type: 'ajaxproxy',
    //    api: {
    //        read: '/admin/app/priceList/entry/price/list',
    //        create: '/admin/app/priceList/create',
    //        update: '/admin/app/priceList/edit',
    //        destroy: '/admin/app/priceList/delete'
    //    },
    //    reader: {
    //        type: 'json',
    //        root: 'items',
    //        successProperty: 'success',
    //        messageProperty: 'message'
    //    },
    //    writer: {
    //        allowSingle: false,
    //        type: 'json'
    //    }
    //}
});