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
    layout: "fit",
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
            viewConfig: {
                deferEmptyText: false,
                stripeRows: false,
                emptyText: '<div class="empty-grid-message">No items to display</div>'
            },
            columns: {
                defaults: {
                    draggable: false,
                    resizable: true,
                    sortable: false,
                    menuDisabled: true
                },
                items: [
                    { text: 'Product Code', dataIndex: 'product', renderer: function (product) { return product.productCode } },
                    { text: 'Name', dataIndex: 'product', renderer: function (product) { return product.name }, flex: 1 },
                    //really need site context to format price properly... assuming its been set as the currenct to call whishlist
                    { text: 'Price', dataIndex: 'product', renderer: function (product) { var value = product.price.price; return value ? Taco.app.context.getCurrent().formatCurrency(value) : ""; } },
                    { text: 'Sale Price', dataIndex: 'product', renderer: function (product) { var value = product.price.saleprice; return value ? Taco.app.context.getCurrent().formatCurrency(value) : ""; } },
                    { text: 'Quantity', dataIndex: 'quantity' },
                    { text: 'Purchasable', dataIndex: 'purchasableStatusType' },
                    { text: 'Date Added', dataIndex: 'auditInfo', renderer: function (auditinfo) { return Ext.util.Format.date(auditinfo.createDate, 'm/d/Y'); } }
                ]
            },
            scope: this
        });

        this.items = [me.wishlistGrid];

        this.callParent(arguments);
    }
});
