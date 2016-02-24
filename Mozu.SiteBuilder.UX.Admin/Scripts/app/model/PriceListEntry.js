/**
 * @class Taco.model.PriceListEntry
 */
Ext.define('Taco.model.PriceListEntry', {
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
            /*serialize: function (v, record) {
               var json = {
                   priceListCode: record.get('priceListCode'),
                   productCode: record.get('productCode'),
                   currencyCode: record.get('currencyCode'),
                   startDate: record.get('startDate')
               };
               return JSON.stringify(json);
            },*/
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
            name: 'priceListEntryMode',
            type: 'string',
            defaultValue: 'Simple'
        }, {
            name: 'priceEntries',
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
            /*convert: function(val, record) {
                return val === 'On' ? true : false;
            },
            serialize: function(val, record) {
                switch (val) {
                    case true:
                        return 'On';
                    case false:
                        return 'Off';
                    default:
                        return null;
                }
            }*/
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