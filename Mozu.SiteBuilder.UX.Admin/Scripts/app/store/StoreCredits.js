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
        createForCustomer: function (customerId, options, onlyActiveCredits) {
            var store, proxy;
            options || (options = {});
            Ext.apply(options, {
                autoLoad: false,
                filters: [
                    {
                        property: 'customerId',
                        value: customerId
                    }
                ]
            });

            store = Ext.create('Taco.store.StoreCredits', options);

            proxy = store.getProxy();
            proxy['extraParams'] || (proxy['extraParams'] = {});

            if (onlyActiveCredits) {
                proxy.extraParams.advancedSearch = Ext.JSON.encodeValue({
                    'activatedateto': new Date(),     // It's been activated by now
                    'expirationdatefrom': new Date(), // It hasn't expired yet
                    'currentbalancefrom': 0.0001      // It still has a balance
                });
            }

            return store;
        }
    }
});
