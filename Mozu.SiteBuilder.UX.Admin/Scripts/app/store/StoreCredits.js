Ext.define('Taco.store.StoreCredits', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.StoreCredit',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    sorters: [{
        property: 'createDate',
        direction: 'DESC'
    }],
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
