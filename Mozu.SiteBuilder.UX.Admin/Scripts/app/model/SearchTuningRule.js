/**
 * @class Taco.model.SearchTuningRule
 */
Ext.define('Taco.model.SearchTuningRule', {
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
            name: 'id', //required for server side.
            type: 'string'
        }, {
            name: 'code', //required, regex like category/product code.
            type: 'string'
        }, {
            name: 'name',  //required
            type: 'string'
        }, {
            name: 'description',
            type: 'string'
        }, {
            name: 'keywords',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'keywordsJoined',
            type: 'string',
            persist: false,
            convert: function (value, record) {
                return (record.get('keywords')) ? record.get('keywords').join(',') : '';
            }
        }, {
            name: 'keywordObjects',
            type: 'auto',
            persist: false,
            convert: function (value, record) {
                if (!record.get('keywords')) {
                    return [];
                }
                return Ext.Array.map(record.get('keywords'), function(word) {
                    return { 'keyword': word };
                });
            }
        }, {
            name: 'filters',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'categoryFilters',
            type: 'auto',
            defaultValue: [],
            persist: false,
            convert: function (value, record) {     //todo: if other filters in future, need to filter the filters for cats greg_murray on 10/19/2015
                 return Ext.Array.filter(record.get('filters'), function(filter) {
                     return (filter.key === 'categoryCode');
                 });
             }
        }, {
            name: 'categoriesJoined',
            type: 'string',
            persist: false,
            convert: function (value, record) {
                var categories = record.get('categoryFilters');
                if (!categories) {
                    return '';
                }
                var catValues = Ext.Array.map(categories, function(catFilter) {
                    return catFilter.value;
                });
                return catValues.join(',');
            }
        }, {
            name: 'isActive',
            type: 'boolean',
            defaultValue: true
        }, {
            name: 'status',
            type: 'string',
            persist: false,
            convert: function (value, record) {
                if (!record.get('isActive')) {
                    return 'Disable';
                }
                if (record.get('startDate') || record.get('endDate')) {
                    return 'Scheduled';
                }
                return 'Active';
            }
        }, {
            name: 'isDefault',
            type: 'boolean',
            defaultValue: false
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
            name: 'boostedProducts',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'blockedProducts',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'siteId',
            type: 'int',
            useNull: true
        }, {
            name: 'siteName',
            type: 'string',
            persist: false,
            convert: function (value, record) {
                if (!record.get('siteId'))
                    return '';
                var site = Taco.app.context.findSite(record.get('siteId'));
                return (site) ? site.name : '';
            }
        }, {
            name: 'createBy',
            type: 'string',
            useNull: true
        }, {
            name: 'createByUser',
            type: 'string',
            convert: Taco.core.util.Common.getCreateByUser
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
            convert: Taco.core.util.Common.getLastModifiedByUser
        }, {
            name: 'lastModifiedDate',
            type: 'date',
            useNull: true,
            dateFormat: 'c'
        }
    ],

    getSites: function(isCatalogLevel) {
        var site,
            catalog,
            sites;
        if (!(Taco.app && Taco.app.context)){
            return [];
        }
        if (isCatalogLevel) {
            catalog = Taco.app.context.getContextAtLevel('c');
            sites = catalog.getSites();
        } else {
            site = Taco.app.context.getContextAtLevel('s');
            sites = [];
            sites.push(site);
        }
        return Ext.Array.map(sites, function(site) {
            return { id: site.id, name: site.name };
        });
    },

    getDeletePromptMessage: function() {
        var msg = 'Are you sure you want to delete "' + this.get('name') + '"?';
        if (this.get('categoryFilters').length > 1) {
            msg += '<br/>It will affect these categories: ' + this.get('categoriesJoined');
        }
        return msg;
    },

    validations: [
        {field: 'code', type: 'length', max: 30},
        {field: 'name', type: 'length', max: 250}
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/SearchTuningRule/list',
            create: '/admin/app/SearchTuningRule/create',
            update: '/admin/app/SearchTuningRule/edit',
            destroy: '/admin/app/SearchTuningRule/delete'
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