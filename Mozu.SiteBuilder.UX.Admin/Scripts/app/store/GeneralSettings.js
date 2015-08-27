/**
 * @class Taco.store.GeneralSettings
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */

Ext.define('Taco.store.GeneralSettings', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.GeneralSettings',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});