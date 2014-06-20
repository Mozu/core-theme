/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.EntityEditors', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.EntityEditor',
        storeManagerConfig: {
            clearFilters: false,
            contextLevel: 't',
            clearSort: false,
            autoLoad: true
        },
    }
);
