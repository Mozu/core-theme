Ext.define('Taco.store.Wishlists', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Wishlist',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    autoLoad: true,
    storeManagerConfig: {
        autoLoad: true,
        createOnly: true
    },
    constructor: function(options) {
        this.callParent(arguments);

        if (!options || !options['customerAccountId'])
            throw "a table";

        this.getProxy().setExtraParam('customerAccountId', options['customerAccountId']);
    }
});