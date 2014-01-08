Ext.define('Taco.store.StoreCredits', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.StoreCredit',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,

    statics: {
        createForCustomer: function(customerId, options) {
            var store, proxy;
            options || (options = {});
            Ext.apply(options, { autoLoad: false });

            store = Ext.create('Taco.store.StoreCredits', options);
            proxy = store.getProxy();
            
            proxy['extraParams'] || (proxy['extraParams'] = {});
            proxy.extraParams['customerId'] = customerId;

            return store;
        }
    }
});
