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
            name: 'mode',
            type: 'int'
        }, {
            name: 'enabled',
            type: 'boolean',
            defaultValue: true
        }, {
            name: "discountsRestricted",
            type: "boolean",
            useNull: true
        }, {
            name: "discountsRestrictedStartDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        }, {
            name: "discountsRestrictedEndDate",
            type: "date",
            useNull: true,
            dateFormat: 'c'
        }, {
            name: 'prices',
            type: 'auto',
            defaultValue: []
        }, {
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

    //getDeletePromptMessage: function() {
    //    var msg = 'Are you sure you want to delete "' + this.get('name') + '"?';
    //    //if (this.get('pricingEntries').length > 1) {
    //    //    msg += '<br/>It will affect these categories: ' + this.get('categoryNamesJoined');
    //    //}
    //    return msg;
    //},

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