Ext.define('Taco.store.StoreCredits', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.StoreCredit',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
        property: 'activationDate',
        direction: 'DESC'
    }],
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/credits/list',
            create: '/admin/app/customer/credits/create',
            update: '/admin/app/customer/credits/edit',
            destroy: '/admin/app/customer/credits/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    },
    statics: {
        createForCustomer: function(customerId, options) {
            var store, proxy;
            options || (options = {});
            Ext.apply(options, {
                autoLoad: false,
                filters: [
                    {
                        property: 'customerId',
                        value: customerId
                    },
                    {
                        filterFn: function(record) {
                            return record.get('currentBalance') > 0;
                        }
                    }
                ]
            });

            store = Ext.create('Taco.store.StoreCredits', options);
            //proxy = store.getProxy();
            
            //proxy['extraParams'] || (proxy['extraParams'] = {});
            //proxy.extraParams['customerId'] = customerId;

            return store;
        }
    }
});
