/**
* @class Taco.store.Categories
* @author Jason Cochran
* The Categories store
*/


Ext.define('Taco.store.Categories', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Category',
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    },
    load: function (options) {
        var me = this;
        
        options = options || {};

        if (typeof options == 'function') {
            options = {
                callback: options
            };
        }

        options = Ext.apply({
            siteId:me.siteId
        }, options);
        
        return me.callParent([options]);
    },
    reload: function (options) {

        var me = this;

        options = options || {};

        if (typeof options == 'function') {
            options = {
                callback: options
            };
        }
        

        options = Ext.apply({
            siteId: siteId
        }, options);

        return me.callParent([options]);
    }
});
