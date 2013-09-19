/**
 * @class Taco.core.data.StoreManager
 */


Ext.define('Taco.core.data.StoreManager', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    singleton: true,
    stores: null,
    constructor: function (config) {
        var me = this;
        me.stores = new Ext.util.MixedCollection();
        me.mixins.observable.constructor.call(me, config);
        me.callParent(arguments);
        me.on('afterproxyrequest', me.afterProxyRequest, me);
    },

    getOrCreate: function (config, contextSuffix) {
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
            if (!config.createOnly) {
                store = me.stores.getByKey(id);
            }

        }
        if (!store) {
            config.type = config.type || 'Ext.data.Store';
            var cc = Ext.apply({ runtimeContext: contextSuffix }, config);
            delete (cc.autoLoad);
            store = Ext.create(config.type, cc);
            if (store.storeManagerConfig) {
                config = Ext.applyIf(config, store.storeManagerConfig);
            }
            if (!config.createOnly) {
                me.stores.add(id, store);
            }
        }
        if (store.storeManagerConfig) {
            config = Ext.applyIf(config, store.storeManagerConfig);
        }
        if (config.contextLevel && !contextSuffix) {

            if (config.contextLevel == 'sc') {
                ctxLvl = '-sc=' + Taco.app.context.getSiteId() + ';' + Taco.app.context.getSiteGroupId();
            } else if (config.contextLevel == 'c') {
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
            if (store.lastOptions && store.lastOptions.params && store.lastOptions.params.filter) {
                needsRefresh = true;
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
            if (config.extraParams) {
                store.getProxy().extraParams = config.extraParams.params;
            }
            store.load();
            store.hasUpdates = null;
        }

        if (config.autoLoad && !store.hasLoaded()) {
            if (config.extraParams) {
                store.getProxy().extraParams = config.extraParams.params;
            }
            store.load();
        }
        return store;
    },
    afterProxyRequest: function (request, success, model) {

        this.stores.each(function (store) {
            if (model.$className != store.model.$className) {
                return true;
            }

            if (request.records && request.records[0].stores && Ext.Array.indexOf(request.records[0].stores, store) > -1) {
                return true;
            }
            store.hasUpdates = true;
            store.lastUpdate = request.action;
            store.fireEvent('afterproxyrequest', store, request, success, model);
            return true;
        });
    },
    markChanged: function (selector, isChanged) {
        var fn;
        isChanged = isChanged === false ? false : true;
        if (Ext.isFunction(selector)) {
            fn = selector;
        } else if (Ext.isString(selector)) {
            fn = function (store) {
                return store.$className == selector || store.model.$className == selector;
            };
        } else {
            Ext.raise("bad");
        }
        
        this.stores.each(function (store) {
            if ( fn(store)) {
                store.hasUpdates = isChanged;
            }
        });

    },
    getCategoryTreeBySite: function (siteId) {
        if (!Ext.isNumeric(siteId)) {
            siteId = Taco.app.context.getCurrentSite().id;
        }
        return this.getOrCreate({
            type: 'Taco.store.CategoriesTree',
            id: 'Taco.store.CategoriesTree-' + siteId,
            createOnly: true,
            siteId: siteId
        });

    }
});