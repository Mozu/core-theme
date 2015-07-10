/**
 * @class Taco.store.PublishSets
 */

    Ext.define('Taco.store.PublishSetsGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.PublishSet',
        remoteFilter: true,
        pageSize: 25,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'm',
            clearSort: true,
            autoLoad: true
        },
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' || 'desc'
        }
    });
