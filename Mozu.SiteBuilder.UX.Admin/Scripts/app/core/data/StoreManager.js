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
        var me = this, store, needsRefresh, ctxLvl, id, proxy;
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


            if (!Ext.isArray(config.contextLevel)) {
                config.contextLevel = config.contextLevel.split(',');
            }
            ctxLvl = '';
            Ext.each(config.contextLevel, function (ctxType) {
                switch (ctxType) {
                case 'sc':
                case 'mc':
                {
                    ctxLvl += '-mc=' + Taco.app.context.getMasterCatalogId();
                    break;
                }
                case 'c':
                {
                    ctxLvl += '-c=' + Taco.app.context.getMasterCatalogId()+'-'+ Taco.app.context.getCatalogId();
                    break;
                }
                case 's':
                {
                    ctxLvl += '-s=' + Taco.app.context.getMasterCatalogId() + '-' + Taco.app.context.getCatalogId()+'-'+ Taco.app.context.getSiteId();
                    break;
                }
                case 't':
                {
                    ctxLvl += '-t=' + Taco.app.context.getTenantId();
                    break;
                }
                }

                

            }, this);

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
        if (store.hasUpdates || store.needsRefresh) {
            needsRefresh = true;
        }

        if (needsRefresh) {
            if (config.extraParams) {
                proxy = store.getProxy();
                proxy.extraParams = Ext.apply(proxy.extraParams || {}, config.extraParams.params);
            }
            store.load();
            store.hasUpdates = null;
            store.needsRefresh = null;
        }

        if (config.autoLoad && !store.hasLoaded()) {
            if (config.extraParams) {
                proxy = store.getProxy();
                proxy.extraParams = Ext.apply(proxy.extraParams || {}, config.extraParams.params);
            }
            store.load();
        }
        return store;
    },

    invalidateCachedStores: function (invalidStores) {
        var me = this;

        if (invalidStores.length) {
            // clear out any dependent or related stores that were invalidated by the store updates
            Ext.Array.each(invalidStores, function (key) {
                var contextId = Taco.app.context.getCurrent().id;
                var removedStore1 = this.stores.removeAtKey(key);
                // remove any site context scoped variants of the store;
                if (contextId) {
                    var removedStore2 = this.stores.removeAtKey(key + "-s=" + contextId);
                }
            }, me);
        }
    },
    onAjaxRequestComplete: function (conn, response, options) {
        if (!options || !options.method || !options.url) {
            return;
        }

    },
    afterProxyRequest: function (request, success, model) {
        var me = this,
            invalidStores = [];


        // helper method for accepting string or array values for invalidateCachedStores configurations;
        function updateInvalidStores (val) {
            // check to see if changes to this store should invalidate related stores;
            if (val) {
                if (Ext.isString(val)) {
                    invalidStores.push(val);
                } else {
                    invalidStores = Ext.Array.merge(val);
                }
            }
        }

        // need to check the request.records for any records(model) that will invalidate stores; 
        // This is the use casew where you are persisting a model seperate from a store;
        var record = request.records[0];
        if (record && record.invalidateCachedStores) {
            updateInvalidStores(record.invalidateCachedStores);
        }

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

            // check store for related stores that need to be invalidated
            updateInvalidStores(store.invalidateCachedStores);

            return true;
        });

        // remove any cached stores that were invalidated by this call;
        me.invalidateCachedStores(invalidStores);

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
            if (fn(store)) {
                store.hasUpdates = isChanged;
            }
        });

    },
    getCategoryTreeByCatalog: function (catalogId) {
        if (!Ext.isNumeric(catalogId)) {
            catalogId = Taco.app.context.getCatalogId();
        }
        return this.getOrCreate({
            type: 'Taco.store.CategoriesTree',
            id: 'Taco.store.CategoriesTree-' + catalogId,
            createOnly: true,
            catalogId: catalogId
        });

    }
});