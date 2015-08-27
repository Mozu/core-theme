/**
 * @class  Taco.overrides.data.AbstractStore
 * @author Travis Johnson
 * @description Overrides Ext.data.AbstractStore
 */
Ext.define('Taco.overrides.data.AbstractStore', {

    override: 'Ext.data.AbstractStore',

    constructor: function () {
        this.callParent(arguments);
        
        this.dirtyState = false;

        // extra filters to be added to all calls. these will be combined with the store.filters; Survives call to clearFilter(); Much like the extraParams
        this.extraFilters = new Ext.util.MixedCollection();

        this.on({
            load: function (store) {
                this.storeHasLoaded = true;
                this.dirtyStateCheck();
            },
            update: function () {
                this.dirtyStateCheck();
            },
            datachanged: function () {
                this.dirtyStateCheck();
            },
            beforeload: function (store, operation) {
                store.lastOperation = operation;
                if (store.remoteFilter === false) {
                    operation.filters = [];
                }
                
                // add in any required filters for this store; these filters will always be submitted since they are added after any calls to clear the filters;
                if (store.extraFilters.getCount()) {
                    operation.filters = Ext.Array.merge(operation.filters, store.extraFilters.items);
                }
                
            },
            
            scope: this
        });
    },
    abort: function () {
        if (this.lastOperation && this.isLoading()) {
            Ext.Object.each( Ext.Ajax.requests, function (key, val) {
                if (val.options == this.lastOperation.request) {
                    this.lastOperation.request.xhr = val.xhr;
                    this.lastOperation.request.options = this.lastOperation;

                }
            }, this);
            Ext.Ajax.abort(this.lastOperation.request);
        }
        
    },
    applyState: function () {
        this.lastOptions = null;
        this.callParent(arguments);
    },
    destroyStore: function () {
        var me = this;
        if (!me.isDestroyed) {
            // clean up the extraFilters mixedCollection that was added above;
            me.extraFilters = null;
        }
        this.callParent(arguments);
    },

    dirtyStateCheck: function () {
      
        var currentState = this.isDirty();

        if (currentState === this.dirtyState) {
            return;
        }
        this.dirtyState = currentState;
        this.fireEvent('dirtychange', this, currentState);
    },

    isDirty: function () {
        return this.getNewRecords().length !== 0 || this.getUpdatedRecords().length !== 0 || this.getRemovedRecords().length !== 0;
    },

    hasLoaded: function () {
        return !!this.lastOptions;
    },
    hasCompletedLoading: function () {
        return !this.isLoading() && this.storeHasLoaded;
    },

    whenLoaded: function (callback, scope) {
        var me = this,
            fn = function () {
                me.un('load', fn);
                callback.call(scope || callback);
            };

        if (this.hasCompletedLoading()) Ext.defer(fn, 1);
        else this.on('load', fn, this,{single:true});
    },

    removeOwnedListener: function (owner) {
        var me = this;
        Ext.Object.each(me.events, function (eventName, eventObj) {
            var listners = Ext.Array.clone(eventObj.listeners);
            Ext.each(listners, function (listnerCfg) {
                if (listnerCfg.scope === owner) {
                    me.un(eventName, listnerCfg.fn, owner);
                }
            });
        });
    },

    pluck: function (field) {
        var result = [];

        this.each(function (record) {
            result.push(record.get(field));
        });

        return result;
    },

    contains: function (record) {
        var found = false;

        this.each(function (item) {
            if (record === item) {
                found = item;
                return false;
            }
        });

        return found;
    },

    containsById: function (record) {
        var found = false;

        this.each(function (item) {
            if (record.getId() === item.getId()) {
                found = item;
                return false;
            }
        });

        return found;
    },

    containsByField: function (record, field) {
        var found = false;

        this.each(function (item) {
            if (record.get(field) === item.get(field)) {
                found = item;
                return false;
            }
        });

        return found;
    },

    containsByFn: function (fn, record) {
        var found = false;

        this.each(function (item) {
            if (fn(item, record)) {
                found = item;
                return false;
            }
        });

        return found;
    }
});