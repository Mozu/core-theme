
/**
* @class Taco.store.WidgetInstances
* @author Thomas Phipps
* The WidgetDefinitions store
*/



Ext.define('Taco.store.WidgetInstances', {
    requires: ['Taco.model.WidgetInstance'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.WidgetInstance',
    pageSize: 200,
    remoteSort: false,
    remoteFilter: false,
    autoLoad: false
});
