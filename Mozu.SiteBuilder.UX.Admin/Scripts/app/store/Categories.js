/**
* @class Taco.store.Categories
* @author Jason Cochran
* The Categories store
*/


Ext.define('Taco.store.Categories', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Category',
    storeManagerConfig: {
        createOnly: true,
        autoLoad:true
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
            catalogId:me.catalogId
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
            catalogId: catalogId
        }, options);

        return me.callParent([options]);
    }
});
