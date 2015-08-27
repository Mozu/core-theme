
	/**
	 * @class Taco.store.Customers
	 */
    Ext.define('Taco.store.CustomerGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.CustomerAccount',
        pageSize: 50,
        remoteSort: true,
        remoteFilter: true,

        storeManagerConfig: {
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        },
        proxy: {
            type: 'ajaxproxy',
            extraParams: {
                showAnonymous: true
            },
            api: {
                read: '/admin/app/customer/list',
                create: '/admin/app/customer/create',
                update: '/admin/app/customer/edit',
                destroy: '/admin/app/customer/delete'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: 'message'
           
            },
            writer: {
                allowSingle: false,
                type: 'json'
            }
        }




    });
