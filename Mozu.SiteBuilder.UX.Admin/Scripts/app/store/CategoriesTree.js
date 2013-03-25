/**
* @class Taco.store.CategoriesTree
* @author Jason Cochran
* The Categories store
*/
Ext.define('Taco.store.CategoriesTree', {
    extend: 'Taco.store.shared.TreeStore',
    model: 'Taco.model.Category',
    requires: ['Taco.model.Category'],
    remoteFilter:true,
    batchUpdateMode: "operation",
    defaultRootId: -1,
    nodeParam: 'nodeQuery',
    root: {
        expanded: true,
        isLoaded:false,
        id:-1
    },
    storeManagerConfig: {
        //clearFilters: true,
        //clearSort: true,
        //autoLoad: true
    }
   });
