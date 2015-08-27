/**
 * @author Michael Speed Elder
 */

Ext.define('Taco.store.GatewayDefinitions', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.GatewayDefinitions',
    storeManagerConfig: {
    clearFilters: true,
    clearSort: true,
    autoLoad: true
}
});