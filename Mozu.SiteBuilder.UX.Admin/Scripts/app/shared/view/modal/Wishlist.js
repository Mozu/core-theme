/**
 * @class Taco.view.shared.modal.Address
 */
Ext.define('Taco.shared.view.modal.Wishlist', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.data.Store',
        'Taco.store.Wishlists',
        'Taco.model.WishlistItem'
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
        me.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';

        me.wishlistStore = Ext.create('Taco.store.Wishlists', { customerAccountId: this.record.getId() });
        me.wishlistItemStore = Ext.create('Ext.data.Store', { model: 'Taco.model.WishlistItem', autoLoad: false });

        me.wishlistStore.on('load', function() {
            var defaultWishlist = this.first();
            if (defaultWishlist)
                me.wishlistItemStore.loadData( defaultWishlist.getData().items );
        });

        me.wishlistGrid = Ext.create('Ext.grid.Panel', {
            store: this.wishlistItemStore,
            columns: [
                { text: 'Product Code', dataIndex: 'product', renderer: function(product) { return product.productCode } },
                { text: 'Name', dataIndex: 'product', renderer: function(product) { return product.name } },
                { text: 'Price', dataIndex: 'product', renderer: function (product) { var value = product.price.price; return value ? Ext.util.Format.usMoney(value) : ""; } },
                { text: 'Sale Price', dataIndex: 'product', renderer: function (product) { var value = product.price.saleprice; return value ? Ext.util.Format.usMoney(value) : ""; } },
                { text: 'Quantity', dataIndex: 'quantity' },
                { text: 'Purchasable', dataIndex: 'purchasableStatusType' },
                { text: 'Date Added', dataIndex: 'auditInfo', renderer: function (auditinfo) { return Ext.util.Format.date(auditinfo.createDate, 'm/d/Y'); } }
            ],
            scope: this
        });

        this.items = [me.wishlistGrid];

        this.callParent(arguments);
    }
});
