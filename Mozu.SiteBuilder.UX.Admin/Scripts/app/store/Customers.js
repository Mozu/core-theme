
	/**
	 * @class Taco.store.Customers
	 */
    Ext.define('Taco.store.Customers', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CustomerAccount',
        pageSize: 50,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        }
    });
