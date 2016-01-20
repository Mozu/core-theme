/**
* @class Taco.store.LayoutWidgetDefinitions
* @author Ben Cripps
* The LayoutWidgetDefinitions store
*/

    
    Ext.define('Taco.store.LayoutWidgetDefinitions', {
        requires: ['Taco.model.LayoutWidgetDefinition'],
        extend: 'Ext.data.Store',
        model: 'Taco.model.LayoutWidgetDefinition',
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
