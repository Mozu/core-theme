/**
 * @class Taco.store.ItemFilters
 * @author james zetlen
 * The ItemFilters store
 */


    Ext.define('Taco.store.ItemFilters', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.ItemFilter',
        pageSize: 25,
        remoteSort: false,
        remoteFilter: false,
        autoLoad:true
              
    });