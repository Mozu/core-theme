/**
 * @class Taco.view.phoneOrder.ItemsSection
 * @author James Zetlen
 */
Ext.define('Taco.view.phoneOrder.ItemsSection', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.simplegrid.Grid', 'Taco.model.Product', 'Taco.model.OrderItem'],

    title: 'Cart',

    createTitle: 'Cart',
    editTitle: 'Cart',

    addFromSkuField: function () {
        var me = this,
            sku = me.skuField.getValue(),
            quantity = me.quantityField.getValue();
        var Product = Ext.ModelManager.getModel('Taco.model.Product');
        Product.load(sku, {
            bypassCache: true,
            success: function(p) {
                if (p !== null)
                {
                    // TODO: check whether this product is already added and update quantity instead.
                    var orderitem = Ext.create('Taco.model.OrderItem', {
                        product: p,
                        quantity: quantity || 1
                    });
                    me.store.add(orderitem);
                    me.skuField.reset();
                    me.quantityField.reset();
                }
            }
        });
    },
    onSpecialKey: function (cmp, e) {
        if (e.getKey() === e.ENTER) {
            this.addFromSkuField();
        }
    },
    initComponent: function () {
        var me = this;

        me.skuField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'SKU',
            name: 'sku',
            listeners: {
                specialkey: me.onSpecialKey,
                scope: me
            }
        }),

        me.quantityField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Qty',
            name: 'quantity',
            listeners: {
                specialkey: me.onSpecialKey,
                scope: me
            }
        });

        me.tbar = [
            me.skuField,
            me.quantityField,
        {
            xtype: 'button',
            text: 'Add',
                disabled: false,
                listeners: {
                    click: me.addFromSkuField,
                    scope: me
                }
        },
        {
            xtype: 'button',
            text: 'Search'
        },
        '->',
        {
            xtype: 'button',
            text: 'Clear All',
            onClick: function () {
                me.store.removeAll();
            }
        }
        ];

        //// this store is like a cart. It contains the items we will add to our order.
        //me.store = Ext.create('Ext.data.Store', {
        //    model: 'fakeOrderItem',
        //    data: []
        //});

        // this store, or "repository", will allow us to do searches for products (apply filters and .load()).
        me.repo = Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.Products', clearFilters:true , clearSort:true });

        me.items = [{
            xtype: 'simplegrid',
            // store: Taco.core.data.StoreManager.getOrCreate({ type: 'Taco.store.OrderItems', clearFilters: true, clearSort: true }),
            store: me.store,
            columns: [
                {text: 'Product Code', dataIndex: 'product', renderer: function(product) { return product.get("productCode") }, editable: false},
                {text: 'Product Name', dataIndex: 'product', renderer: function(product) { return product.get("productName") }, editable: false},
                {text: 'Quantity', dataIndex: 'quantity', editable: true}
            ]
        }];

        this.callParent(arguments);

        window.poGrid = me.items.get(0);
    }
});