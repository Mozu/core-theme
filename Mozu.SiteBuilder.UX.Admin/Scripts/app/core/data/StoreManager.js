/**
 * @class Taco.core.data.StoreManager
 */
Ext.define('Taco.core.data.StoreManager', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    singleton: true,
    stores:null,
    constructor: function (config) {
        var me = this;
        me.stores = new Ext.util.MixedCollection();
        
        me.callParent(arguments);
    },

    getOrCreate: function (config) {
        var me = this, store, needsRefresh;
        if (Ext.isString(config)) {
            config = { type: config };
        }
        config.id = config.id || config.type || config.model;
        store = me.stores.getByKey(config.id);
        if (!store) {
            config.type = config.type || 'Ext.data.Store';
            var cc = Ext.apply({}, config);
            delete(cc.autoLoad);
            store = Ext.create(config.type, cc);
            if (!config.createOnly) {
                me.stores.add(config.id, store);
            }
        }
        if (config.clearFilters ) {
            
            if (store.isFiltered() || (store.filters && store.filters.length)) {
                store.clearFilter(true);
                if (store.remoteFilter) {
                    needsRefresh = true;
                }
            } else if (store.currentPage > 1) {
                needsRefresh = true;
                store.currentPage = 1;
            }
            
        }
        if (config.clearSort) {
            if ( store.sorters && store.sorters.length > 0 ) {
                store.sorters.clear();
                if (store.remoteSort) {
                    needsRefresh = true;
                }
            }
        }
        

        if (needsRefresh) {
            store.load();
        }
        if (config.autoLoad && !store.hasLoaded()) {
            store.load();
        }
        return store;
    }

    

});
    