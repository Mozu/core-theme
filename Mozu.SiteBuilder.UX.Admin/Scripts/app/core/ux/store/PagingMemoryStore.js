/*
 *  This is an extension of a forum ux control that creates a locally paged store where the entire data set is loaded in the store but the ui is paged;
 *  This specific store uses a memory proxy but the base class allows for the full data set to be loaded using an ajax proxy. 
 *  
 *
 *
 *
 *
 *
 */

Ext.define('Taco.core.ux.store.PagingMemoryStore', {
    extend: 'Ext.ux.data.PagingStore',
    alias: 'store.pagingmemorystore',

    // adding in the paged memory proxy by default. 
    proxy: {        
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },

    // need to reload and resort with every add with paged memory proxy
    add: function () {
        
        this.callParent(arguments);
        // need to relaod the store to get the paging toolbar to update        
        this.reload();
        this.sort();
    }


    ,

    // extracts all of the data from the store;
    getValues: function () {

        var proxyData = this.proxy.data;

        return this.allData

        //if (proxyData && proxyData.length > this.pageSize) {
        //    return Ext.Array.unique(this.data.items.concat(this.proxy.data));
        //}
        //else {
        //    return this.data.items;
        //}
    }
   
});