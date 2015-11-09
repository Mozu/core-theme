/* 
Sourced from:
https://github.com/aghuddleston/Ext.ux.data.PagingStore/tree/extjs-4.2-branch

https://github.com/aghuddleston/Ext.ux.data.PagingStore/blob/extjs-4.2-branch/02_JsonPagingStoreTest.js

MIT Licencse:
https://github.com/aghuddleston/Ext.ux.data.PagingStore/blob/extjs-4.2-branch/LICENSE.txt

/*

The MIT License (MIT)

Copyright (c) {{{year}}} {{{fullname}}}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Based on Ext.ux.data.PagingStore for Ext JS 3, by Condor, found at
 * http://www.sencha.com/forum/showthread.php?71532-Ext.ux.data.PagingStore-v0.5
 * Stores are configured as normal, with whatever proxy you need for remote or local.  Set the
 * lastOptions when defining the store to set start, limit and current page.  Store should only
 * request new data if params or extraParams changes.  In Ext JS 4, start, limit and page are part of the
 * options but no longer part of params.
 * Example remote store:
 *     var myStore = Ext.create('Ext.ux.data.PagingStore', {
    model: 'Artist',
    pageSize: 3,
    lastOptions: {start: 0, limit: 3, page: 1},
    proxy: {
    type: 'ajax',
    url: 'url/goes/here',
    reader: {
    type: 'json',
    root: 'rows'
}
}
});
 * Example local store:
 *    var myStore = Ext.create('Ext.ux.data.PagingStore', {
    model: 'Artist',
    pageSize: 3,
    proxy: {
    type: 'memory',
    reader: {
    type: 'array'
}
},
    data: data
});
 * To force a reload, delete store.lastParams.
 */
Ext.define('Ext.ux.data.PagingStore', {
    extend: 'Ext.data.Store',
    alias: 'store.pagingstore',

    destroyStore: function () {
        this.callParent(arguments);
        this.allData = null;
    },

    /**
	 * Currently, only looking at start, limit, page and params properties of options.  Ignore everything
	 * else.
	 * @param {Ext.data.Operation} options
	 * @return {boolean}
	 */
    isPaging: function (options) {
        var me = this,
			start = options.start,
			limit = options.limit,
			page = options.page,
			currentParams;

        if ((typeof start != 'number') || (typeof limit != 'number')) {
            delete me.start;
            delete me.limit;
            delete me.page;
            me.lastParams = options.params;
            return false;
        }

        me.start = start;
        me.limit = limit;
        me.currentPage = page;
        var lastParams = this.lastParams;
        currentParams = Ext.apply({}, options.params, this.proxy ? this.proxy.extraParams : {});
        me.lastParams = currentParams;
        if (!this.proxy) {
            return true;
        }
        // No params from a previous load, must be the first load
        if (!lastParams) {
            return false;
        }

        //Iterate through all of the current parameters, if there are differences, then this is
        //not just a paging request, but instead a true load request
        for (var param in currentParams) {
            if (currentParams.hasOwnProperty(param) && (currentParams[param] !== lastParams[param])) {
                return false;
            }
        }
        //Do the same iteration, but this time walking through the lastParams
        for (param in lastParams) {
            if (lastParams.hasOwnProperty(param) && (currentParams[param] !== lastParams[param])) {
                return false;
            }
        }
        return true;
    },

    applyPaging: function () {
        var me = this,
			start = me.start,
			limit = me.limit,
			allData, data;

        if ((typeof start == 'number') && (typeof limit == 'number')) {
            allData = this.data;
            data = new Ext.util.MixedCollection(allData.allowFunctions, allData.getKey);
            data.addAll(allData.items.slice(start, start + limit));
            me.allData = allData;
            me.data = data;
        }
    },

    loadRecords: function (records, options) {
        var me = this,
            i = 0,
            length = records.length,
            start,
            addRecords,
            snapshot = me.snapshot,
            allData = me.allData;

        if (options) {
            start = options.start;
            addRecords = options.addRecords;
        }

        if (!addRecords) {
            delete me.allData;
            delete me.snapshot;
            me.clearData(true);
        } else if (allData) {
            allData.addAll(records);
        } else if (snapshot) {
            snapshot.addAll(records);
        }

        me.data.addAll(records);

        if (!me.allData) {
            me.applyPaging();
        }

        if (start !== undefined) {
            for (; i < length; i++) {
                records[i].index = start + i;
                records[i].join(me);
            }
        } else {
            for (; i < length; i++) {
                records[i].join(me);
            }
        }

        /*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
        me.suspendEvents();

        if (me.filterOnLoad && !me.remoteFilter) {
            me.filter();
        }

        if (me.sortOnLoad && !me.remoteSort) {
            me.sort(undefined, undefined, undefined, true);
        }

        me.resumeEvents();
        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);
    },

    loadData: function (data, append) {
        var me = this,
            model = me.model,
            length = data.length,
            newData = [],
            i,
            record;

        me.isPaging(Ext.apply({}, this.lastOptions ? this.lastOptions : {}));

        //make sure each data element is an Ext.data.Model instance
        for (i = 0; i < length; i++) {
            record = data[i];

            if (!(record.isModel)) {
                record = Ext.ModelManager.create(record, model);
            }
            newData.push(record);
        }

        me.loadRecords(newData, append ? me.addRecordsOptions : undefined);
    },

    loadRawData: function (data, append) {
        var me = this,
            result = me.proxy.reader.read(data),
            records = result.records;

        if (result.success) {
            me.totalCount = result.total;
            me.isPaging(Ext.apply({}, this.lastOptions ? this.lastOptions : {}));
            me.loadRecords(records, append ? me.addRecordsOptions : undefined);
            me.fireEvent('load', me, records, true);
        }
    },

    load: function (options) {
        var me = this,
            pagingOptions;

        options = options || {};

        if (typeof options == 'function') {
            options = {
                callback: options
            };
        }

        options.groupers = options.groupers || me.groupers.items;
        options.page = options.page || me.currentPage;
        options.start = (options.start !== undefined) ? options.start : (options.page - 1) * me.pageSize;
        options.limit = options.limit || me.pageSize;
        options.addRecords = options.addRecords || false;

        if (me.buffered) {
            return me.loadToPrefetch(options);
        }
        var operation;

        options = Ext.apply({
            action: 'read',
            filters: me.filters.items,
            sorters: me.getSorters()
        }, options);
        me.lastOptions = options;

        operation = new Ext.data.Operation(options);

        if (me.fireEvent('beforeload', me, operation) !== false) {

            me.loading = true;
            pagingOptions = Ext.apply({}, options);
            if (me.isPaging(pagingOptions)) {
                if (me.allData) {
                    me.data = me.allData;
                    delete me.allData;
                }
                me.applyPaging();
                me.fireEvent("datachanged", me);
                me.fireEvent('refresh', me);
                var r = [].concat(me.data.items);
                me.loading = false;
                me.fireEvent("load", me, r, true);
                if (me.hasListeners.read) {
                    me.fireEvent('read', me, r, true);
                }

                if (options.callback) {
                    options.callback.call(options.scope || me, r, options, true);
                }
                return me;
            }

            me.proxy.read(operation, me.onProxyLoad, me);
        }

        return me;
    },

    insert: function (index, records) {
        var me = this,
            sync = false,
            i,
            record,
            len;
        
        if (Ext.isArray(records) && !records.length) {
            return;
        }

        records = [].concat(records);
        for (i = 0, len = records.length; i < len; i++) {
            record = me.createModel(records[i]);
            record.set(me.modelDefaults);
            // reassign the model in the array in case it wasn't created yet
            records[i] = record;

            me.data.insert(index + i, record);
            record.join(me);

            sync = sync || record.phantom === true;
        }

        if (me.allData) {
            me.allData.addAll(records);
        }

        if (me.snapshot) {
            me.snapshot.addAll(records);
        }

        if (me.requireSort) {
            // suspend events so the usual data changed events don't get fired.
            me.suspendEvents();
            me.sort();
            me.resumeEvents();
        }

        me.fireEvent('add', me, records, index);
        me.fireEvent('datachanged', me);
        if (me.autoSync && sync && !me.autoSyncSuspended) {
            me.sync();
        }
    },

    doSort: function (sorterFn) {
        var me = this,
            range,
            ln,
            i;

        if (me.remoteSort) {
            // For a buffered Store, we have to clear the prefetch cache since it is keyed by the index within the dataset.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                //the load function will pick up the new sorters and request the sorted data from the proxy
                me.load();
            }
        } else {
            if (me.allData) {
                me.data = me.allData;
                delete me.allData;
            }
            me.data.sortBy(sorterFn);
            if (!me.buffered) {
                range = me.getRange();
                ln = range.length;
                for (i = 0; i < ln; i++) {
                    range[i].index = i;
                }
            }
            me.applyPaging();
            me.fireEvent('datachanged', me);
            me.fireEvent('refresh', me);
        }
    },

    getTotalCount: function () {
        return this.allData ? this.allData.getCount() : this.totalCount || 0;
    },

    //inherit docs
    getNewRecords: function () {
        if (this.allData) {
            return this.allData.filterBy(this.filterNew).items;
        }
        return this.data.filterBy(this.filterNew).items;
    },

    //inherit docs
    getUpdatedRecords: function () {
        if (this.allData) {
            return this.allData.filterBy(this.filterUpdated).items;
        }
        return this.data.filterBy(this.filterUpdated).items;
    },

    remove: function (records, /* private */ isMove) {
        if (!Ext.isArray(records)) {
            records = [records];
        }

        /*
         * Pass the isMove parameter if we know we're going to be re-inserting this record
         */
        isMove = isMove === true;
        var me = this,
            sync = false,
            i = 0,
            length = records.length,
            isNotPhantom,
            index,
            record;

        for (; i < length; i++) {
            record = records[i];
            index = me.data.indexOf(record);

            if (me.allData) {
                me.allData.remove(record);
            }

            if (me.snapshot) {
                me.snapshot.remove(record);
            }

            if (index > -1) {
                isNotPhantom = record.phantom !== true;

                // don't push phantom records onto removed
                if (!isMove && isNotPhantom) {

                    // Store the index the record was removed from so that rejectChanges can re-insert at the correct place.
                    // The record's index property won't do, as that is the index in the overall dataset when Store is buffered.
                    record.removedFrom = index;
                    me.removed.push(record);
                }

                record.unjoin(me);
                me.data.remove(record);
                sync = sync || isNotPhantom;

                me.fireEvent('remove', me, record, index);
            }
        }

        me.fireEvent('datachanged', me);
        if (!isMove && me.autoSync && sync && !me.autoSyncSuspended) {
            me.sync();
        }
    },

    filter: function (filters, value) {
        if (Ext.isString(filters)) {
            filters = {
                property: filters,
                value: value
            };
        }

        var me = this,
            decoded = me.decodeFilters(filters),
            i = 0,
            doLocalSort = me.sorters.length && me.sortOnFilter && !me.remoteSort,
            length = decoded.length;

        for (; i < length; i++) {
            me.filters.replace(decoded[i]);
        }

        if (me.remoteFilter) {
            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;

            // For a buffered Store, we have to clear the prefetch cache because the dataset will change upon filtering.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                // Reset to the first page, the filter is likely to produce a smaller data set
                me.currentPage = 1;
                //the load function will pick up the new filters and request the filtered data from the proxy
                me.load();
            }
        } else {
            /**
             * @property {Ext.util.MixedCollection} snapshot
             * A pristine (unfiltered) collection of the records in this store. This is used to reinstate
             * records when a filter is removed or changed
             */
            if (me.filters.getCount()) {
                me.snapshot = me.snapshot || (me.allData && me.allData.clone()) || me.data.clone();
                if (me.snapshot) {
                    me.data = me.snapshot;
                    delete me.allData;
                }
                me.data = me.data.filter(me.filters.items);
                me.applyPaging();

                if (doLocalSort) {
                    me.sort();
                } else {
                    // fire datachanged event if it hasn't already been fired by doSort
                    me.fireEvent('datachanged', me);
                    me.fireEvent('refresh', me);
                }
            }
        }
    },

    clearFilter: function (suppressEvent) {
        var me = this;

        me.filters.clear();

        if (me.remoteFilter) {

            // In a buffered Store, the meaing of suppressEvent is to simply clear the filters collection
            if (suppressEvent) {
                return;
            }

            // So that prefetchPage does not consider the store to be fully loaded if the local count is equal to the total count
            delete me.totalCount;

            // For a buffered Store, we have to clear the prefetch cache because the dataset will change upon filtering.
            // Then we must prefetch the new page 1, and when that arrives, reload the visible part of the Store
            // via the guaranteedrange event
            if (me.buffered) {
                me.pageMap.clear();
                me.loadPage(1);
            } else {
                // Reset to the first page, clearing a filter will destroy the context of the current dataset
                me.currentPage = 1;
                me.load();
            }
        } else if (me.isFiltered()) {
            me.data = me.snapshot.clone();
            delete me.allData;
            delete me.snapshot;
            me.applyPaging();

            if (suppressEvent !== true) {
                me.fireEvent('datachanged', me);
                me.fireEvent('refresh', me);
            }
        }
    },

    isFiltered: function () {
        var snapshot = this.snapshot;
        return !!snapshot && snapshot !== (this.allData || this.data);
    },

    filterBy: function (fn, scope) {
        var me = this;

        me.snapshot = me.snapshot || me.allData.clone() || me.data.clone();
        me.data = me.queryBy(fn, scope || me);
        me.applyPaging();
        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);
    },

    queryBy: function (fn, scope) {
        var me = this,
            data = me.snapshot || me.allData || me.data;
        return data.filterBy(fn, scope || me);
    },

    collect: function (dataIndex, allowNull, bypassFilter) {
        var me = this,
                data = (bypassFilter === true && (me.snapshot || me.allData)) ? (me.snapshot || me.allData) : me.data;

        return data.collect(dataIndex, 'data', allowNull);
    },

    getById: function (id) {
        return (this.snapshot || this.allData || this.data).findBy(function (record) {
            return record.getId() === id;
        });
    },

    removeAll: function (silent) {
        var me = this;

        me.clearData();
        if (me.snapshot) {
            me.snapshot.clear();
        }

        if (me.allData) {
            me.allData.clear();
        }

        // Special handling to synch the PageMap only for removeAll
        // TODO: handle other store/data modifications WRT buffered Stores.
        if (me.pageMap) {
            me.pageMap.clear();
        }
        if (silent !== true) {
            me.fireEvent('clear', me);
        }
    }
});