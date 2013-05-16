/**
* @class Taco.store.WidgetDefinitions
* @author Thomas Phipps
* The WidgetDefinitions store
*/


    
    Ext.define('Taco.store.WidgetDefinitions', {
        requires: ['Taco.model.WidgetDefinition'],
        extend: 'Ext.data.Store',
        model: 'Taco.model.WidgetDefinition',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        autoLoad: true,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
    });
