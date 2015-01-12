/**
* @class Taco.store.WidgetDefinitions
* @author Thomas Phipps
* The WidgetDefinitions store
*/


    
    Ext.define('Taco.store.WidgetDefinitions', {
        requires: ['Taco.model.WidgetDefinition'],
        extend: 'Ext.data.Store',
        model: 'Taco.model.WidgetDefinition',
        pageSize: 100,
        remoteSort: true,
        remoteFilter: true,
        autoLoad: false,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
        
       
        loadPage: function (page, options) {

            options = options || {};
            options.params = options.params || {};
            options.params.themeId = this.themeId;
            return this.callParent([page, options]);
        },
        load: function (options) {
            options = options || {};
            options.params = options.params || {};
            options.params.themeId = this.themeId;
            return this.callParent([options]);
        }
    });
