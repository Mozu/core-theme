/**
 * @class Taco.core.data.StoreManager
 */


Ext.define('Taco.core.data.StoreManager', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    singleton: true,
    stores: null,
    constructor: function(config) {
        var me = this;
        me.stores = new Ext.util.MixedCollection();
        me.mixins.observable.constructor.call(me, config);
        me.callParent(arguments);
        me.on('afterproxyrequest', me.afterProxyRequest, me);
    },

    getOrCreate: function(config, contextSuffix) {
        var me = this, store, needsRefresh, ctxLvl, id;
        if (Ext.isString(config)) {
            config = { type: config };
        }
        if (config.isStore) {
            store = config;
            config = store.storeManagerConfig || {};
            id = config.id || store.id || store.$className;
        } else {
            id = config.id || config.type || config.model;
            if (contextSuffix) {
                id += contextSuffix;
            }
            store = me.stores.getByKey(id);

        }
        if (!store) {
            config.type = config.type || 'Ext.data.Store';
            var cc = Ext.apply({ runtimeContext: contextSuffix }, config);
            delete(cc.autoLoad);
            store = Ext.create(config.type, cc);

            if (!config.createOnly) {
                me.stores.add(id, store);
            }
        }
        if (store.storeManagerConfig) {
            config = Ext.applyIf(config, store.storeManagerConfig);
        }
        if (config.contextLevel && !contextSuffix) {

            if (config.contextLevel == 'c') {
                ctxLvl = '-c=' + Taco.app.context.getSiteGroupId();
            } else if (config.contextLevel == 's') {
                ctxLvl = '-s=' + Taco.app.context.getSiteId();
            }
            if (store.runtimeContext != ctxLvl) {
                return this.getOrCreate(config, ctxLvl);
            }


        }

        if (config.clearFilters) {

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
            if (store.sorters && store.sorters.length > 0) {
                store.sorters.clear();
                if (store.remoteSort) {
                    needsRefresh = true;
                }
            }
        }
        if (store.hasUpdates) {
            needsRefresh = true;
        }

        if (needsRefresh) {
            store.load();
            store.hasUpdates = null;
        }

        if (config.autoLoad && !store.hasLoaded()) {
            store.load();
        }
        return store;
    },
    afterProxyRequest: function(request, success, model) {

        this.stores.each(function(store) {
            if (model.$className != store.model.$className) {
                return true;
            }
            if (request.records && request.records[0].stores && request.records[0].stores.indexOf(store) > -1) {
                return true;
            }
            store.hasUpdates = true;
            store.lastUpdate = request.action;
            store.fireEvent('afterproxyrequest', store, request, success, model);
            return true;
        });
    },
    getCategoryTreeBySite: function (siteId) {
        if (!Ext.isNumeric(siteId)) {
            siteId = Taco.app.context.getCurrentSite().id;
        }
        return this.getOrCreate({
            type: 'Taco.store.CategoriesTree',
            id: 'Taco.store.CategoriesTree-' + siteId,
            createOnly:true,
            filters: [
                {
                    property: 'siteId',
                    value: siteId
                }
            ]
        });

    }
});