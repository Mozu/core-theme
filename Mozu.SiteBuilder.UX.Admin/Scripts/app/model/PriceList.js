/**
 * @class Taco.model.PriceList
 */
Ext.define('Taco.model.PriceList', {
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
    idProperty: 'code',
    fields: [
        {
            name: 'code',
            type: 'string'
        }, {
            name: 'name',
            type: 'string'
        }, {
            name: 'description',
            type: 'string',
            useNull: true
        }, {
            name: 'parentCode',
            type: 'string',
            useNull: true
        }, {
            name: 'enabled',
            type: 'boolean',
            defaultValue: true
        }, {
            name: 'filteredInStorefront',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'validForAllSites',
            type: 'boolean',
            defaultValue: true
        }, {
            name: 'validSites',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'searchIndexSequence',
            type: 'int',
            useNull: true
        }, {
            name: 'resolutionRank',
            type: 'int',
            useNull: true
        }, {
            name: 'customerSegments',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'customerSegmentNames',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'catalogs',
            type: 'auto',
            defaultValue: [],
            convert: function (vals) {
                var catNames = Ext.Array.map(vals, function(catId) {
                    var cat = Taco.app.context.findCatalog(catId);
                    return (cat) ? cat.name : '';
                });
                return catNames.join(',');
            }
        }, {
            name: 'status',
            type: 'string',
            convert: function (val, record) {
                return (record.get('enabled')) ? 'Active' : 'Disabled';
            },
            persist: false
        }, {
            name: 'pricingEntries',
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

    getDeletePromptMessage: function() {
        var msg = 'Are you sure you want to delete "' + this.get('name') + '"?';
        //if (this.get('pricingEntries').length > 1) {
        //    msg += '<br/>It will affect these categories: ' + this.get('categoryNamesJoined');
        //}
        return msg;
    },

    validations: [
        { field: 'code', type: 'length', max: 30},
        { field: 'name', type: 'length', max: 100}
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/priceList/list',
            create: '/admin/app/priceList/create',
            update: '/admin/app/priceList/edit',
            destroy: '/admin/app/priceList/delete'
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