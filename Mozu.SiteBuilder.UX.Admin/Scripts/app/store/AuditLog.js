/**
 * @class Taco.store.AuditLog
 * Audit Log store.
 */

Ext.define('Taco.store.AuditLog', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.AuditLog',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        // Load the data automatically!
        autoLoad: true
    }
});
