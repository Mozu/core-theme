/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.CategoryPicker', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Category',
        pageSize: 20,
       // remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: false,
           // contextLevel: 'c',
            clearSort: false,
            autoLoad: false,
            createOnly: true
        },

        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/category/list'
            },
            extraParams: {
                isPicker: true
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
        },

        loadPage: function (page, options) {
            options = options || {};
            options.params = options.params || {};
            return this.callParent([page, options]);
        },
        load: function (options) {

            //use initialized values or override if in options...
            options = options || {};
            options.params = options.params || {};

            return this.callParent([options]);
        }
    });