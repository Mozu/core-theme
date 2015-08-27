
	/**
	 * @class Taco.store.CustomersPicker
	 */
    Ext.define('Taco.store.CustomersPicker', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CustomerAccountPicker',
        pageSize: 10,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        }
    });
