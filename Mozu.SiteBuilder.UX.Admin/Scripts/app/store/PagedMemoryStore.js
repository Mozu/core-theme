Ext.define('Taco.store.PagedMemoryStore', {
    extend: 'Ext.data.Store',
    requires: [],
    model: 'Ext.data.Model',
    pageSize: 5,
    remoteSort: false,
    remoteFilter: false,
    autoLoad: false,
    //to be overwritten by instantiation
    fields:  ['name', 'taco'],
    data: [],
    proxy: {
        enablePaging: true,
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    constructor: function() {
        if (!this.proxy || this.proxy.type !== 'memory') {
            throw new Error('This store is meant to only be used for stores using a memory proxy');
        }

        this.callParent(arguments);
    },

    listeners: {
        add: function(store, records) {
            this.proxy.data = this.proxy.data || [];
            this.proxy.data.push.apply(this.proxy.data, records);
        },
        remove: function(store, record) {
            Ext.Array.remove(this.proxy.data, record);
        },
        bulkremove: function(store, records) {
            Ext.Array.each(records, function(rec) {
                Ext.Array.remove(this.proxy.data, rec);
            }, this);
        }
    },

    getValues: function() {
        if (this.proxy.data.length > this.pageSize) {
            return Ext.Array.unique(this.data.items.concat(this.proxy.data));
        }
        else {
            return this.data.items;
        }
    }
});