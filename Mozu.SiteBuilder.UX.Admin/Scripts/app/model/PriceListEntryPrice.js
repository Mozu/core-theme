/**
 * @class Taco.model.PriceListEntryPrice
*/
Ext.define('Taco.model.PriceListEntryPrice', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.util.Common'
    ],
    //behaviors: {  //todo: need behaviors.
    //    read: 24,
    //    create: 25,
    //    update: 26,
    //    destroy: 27
    //},
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'priceListCode',
            type: 'string'
        }, {
            name: 'productCode',
            type: 'string'
        }, {
            name: 'minQuantity',
            type: 'int',
            useNull: true
        }, {
            name: 'maxQuantity',
            type: 'int',
            useNull: true
        }, {
            name: "listPrice",
            type: "float",
            useNull: true
        },
        //{
        //    name: "listPriceCalculation",
        //    type: "auto",
        //    useNull: true
        //},
        {
            name: "salePrice",
            type: "float",
            useNull: true
        },
        //{
        //    name: "salePriceCalculation",
        //    type: "auto",
        //    useNull: true
        //},
        {
            name: "msrp",
            type: "float",
            useNull: true
        }, {
            name: "map",
            type: "float",
            useNull: true
        }, {
            name: "mapStartDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        }, {
            name: "mapEndDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'costCurrencyCode',
            type: 'string'
        }, {
            name: "cost",
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

    belongsTo: 'Taco.model.PriceListEntry',

    validations: [
        { field: 'currencyCode', type: 'length', max: 3 }
    ]

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