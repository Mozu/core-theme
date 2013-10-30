/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Wishlist', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.store.WishList'
    ],
    autoShow: true,
    width: 900,
    title: 'Wishlist',
    formCfg: null,
    closable: true,
    actions: [{
        xtype: 'button',
        itemId: 'primaryAction',
        text: 'Close',
        handler: function () {
            var me = this;
            me.close();
        },
        formBind: true
    }],

    initComponent: function () {
        var me = this;
        this.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        this.wishListStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.WishList');

        me.wishlistGrid = Ext.create('Ext.grid.Panel', {
            store: this.wishListStore,
            columns: [
                { text: 'Product Code', dataIndex: 'code' },
                { text: 'Name', dataIndex: 'name' },
                { text: 'Price', dataIndex: 'price' },
                { text: 'Sale Price', dataIndex: 'saleprice' },
                { text: 'In Stock', dataIndex: 'stock' },
                { text: 'Date Added', dataIndex: 'dateadded' },
                { text: 'Date Purchased', dataIndex: 'datepurchased', flex: 1 }
            ],
            scope: this
        });

        this.items = [me.wishlistGrid];

        this.callParent(arguments);
    }
});
