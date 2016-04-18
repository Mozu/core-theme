/**
 * @class Taco.model.PriceListEntry
 */
Ext.define('Taco.model.PriceListEntry', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.util.Common'
    ],
    behaviors: {
        create: 238,
        read: 239,
        update: 240,
        destroy: 241
    },
    idProperty: 'compositeKey',
    fields: [
        {
            name: 'compositeKey',
            type: 'string',
            convert: function (v, record) {
                return {
                    priceListCode: record.get('priceListCode'),
                    productCode: record.get('productCode'),
                    currencyCode: record.get('currencyCode'),
                    startDate: record.get('startDate')
                };
            },
            persist: false
        },
        {
            name: 'priceListCode',
            type: 'string'
        }, {
            name: 'productCode',
            type: 'string'
        }, {
            name: 'productName',
            type: 'string'
        }, {
            name: 'currencyCode',
            type: 'string'
        }, {
            name: 'startDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'endDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'isVariation',
            type: 'boolean',
            defaultValue: false,
            persist: false
        }, {
            name: 'priceListEntrySequence',
            type: 'int'
        }, {
            name: 'priceListEntryMode',
            type: 'string',
            defaultValue: 'Simple'
        }, {
            name: 'basicListPrice',
            type: 'float',
            persist: false,
            convert: function(val, record) {
                var entryPrice;
                if (record.get('priceListEntryMode') !== 'Simple' || record.get('priceEntries').length === 0) {
                    return '';
                }
                entryPrice = record.get('priceEntries')[0];
                return (entryPrice.listPriceMode === 'Overridden' && entryPrice.listPrice) ? entryPrice.listPrice : '';
            }
        },{
            name: 'basicSalePrice',
            type: 'float',
            persist: false,
            convert: function(val, record) {
                var entryPrice;
                if (record.get('priceListEntryMode') !== 'Simple' || record.get('priceEntries').length === 0) {
                    return '';
                }
                entryPrice = record.get('priceEntries')[0];
                return (entryPrice.salePriceMode === 'Overridden' && entryPrice.salePrice) ? entryPrice.salePrice : '';
            }
        }, {
            name: 'priceEntries',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'extras',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'msrpMode',
            type: 'string',
            defaultValue: 'UseCatalog',
            convert: function(val, record) {
                return val === 'UseCatalog' ? false : true;
            },
            serialize: function(val, record) {
                return val ? 'Overridden' : 'UseCatalog';
            }
        }, {
            name: 'msrp',
            type: 'float',
            useNull: true
        }, {
            name: 'mapMode',
            type: 'string',
            defaultValue: 'UseCatalog',
            convert: function(val, record) {
                return val === 'UseCatalog' ? false : true;
            },
            serialize: function(val, record) {
                return val ? 'Overridden' : 'UseCatalog';
            }
        }, {
            name: 'map',
            type: 'float',
            useNull: true
        }, {
            name: 'mapStartDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'mapEndDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'costMode',
            type: 'string',
            defaultValue: 'UseCatalog',
            convert: function(val, record) {
                return val === 'UseCatalog' ? false : true;
            },
            serialize: function(val, record) {
                return val ? 'Overridden' : 'UseCatalog';
            }
        }, {
            name: 'cost',
            type: 'float',
            useNull: true
        }, {
            name: 'discountsRestricted',
            type: 'boolean',
            useNull: true,
            defaultValue: null
        }, {
            name: 'discountsRestrictedStartDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'discountsRestrictedEndDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        },  {
            name: 'createBy',
            type: 'string',
            useNull: true
        }, {
            name: 'createByUser',
            type: 'string',
            convert: Taco.core.util.Common.getCreateByUser,
            persist: false
        }, {
            name: 'createDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'lastModifiedBy',
            type: 'string',
            useNull: true
        }, {
            name: 'lastModifiedByUser',
            type: 'string',
            convert: Taco.core.util.Common.getLastModifiedByUser,
            persist: false
        }, {
            name: 'lastModifiedDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'options',
            type: 'auto',
            defaultValue: [],
            persist: false
        }, {
            name: 'optionSummary',
            type: 'auto',
            convert: function (item, record) {
                if (!record.get('options') || record.get('options').length === 0)
                    return '';
                return Ext.Array
                    .map(record.get('options'), function(opt) {
                        return opt.attributeFQN.split('~')[1]
                            + ': '
                            + Ext.Array.pluck(opt.values, 'value').join(', ');
                        })
                    .join(', ');
            },
            persist: false
        }, {
            name: 'currentPriceCurrencyCode',
            type: 'string',
            useNull: true
        }, {
            name: 'currentListPrice',
            type: 'float',
            useNull: true
            //persist: false
        }, {
            name: "currentSalePrice",
            type: "float",
            useNull: true
            //persist: false
        }, {
            name: "currentMsrp",
            type: "float",
            useNull: true
            //persist: false
        }, {
            name: "currentCost",
            type: "float",
            useNull: true
            //persist: false
        }, {
            name: 'currentCostCurrencyCode',
            type: 'string',
            useNull: true
        }, {
            name: 'currentMap',
            type: 'float',
            useNull: true
        }, {
            name: 'currentMapStartDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'currentMapEndDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'currentDiscountsRestricted',
            type: 'boolean',
            useNull: true,
            defaultValue: null,
            convert: function(item){
                return (item) ? "On" : "Off";
            }
        }, {
            name: 'currentDiscountsRestrictedStartDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'currentDiscountsRestrictedEndDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }
    ],

    getDeletePromptMessage: function() {
        return 'Are you sure you want to delete this price list entry record?';
    },

    validations: [
        { field: 'currencyCode', type: 'length', max: 3 }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/priceList/entry/list',
            create: '/admin/app/priceList/entry/create',
            update: '/admin/app/priceList/entry/edit',
            destroy: '/admin/app/priceList/entry/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});