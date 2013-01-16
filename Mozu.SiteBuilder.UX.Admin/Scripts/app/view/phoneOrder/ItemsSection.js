/**
 * @class Taco.view.phoneOrder.ItemsSection
 * @author James Zetlen
 */
Ext.define('Taco.view.phoneOrder.ItemsSection', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.simplegrid.Grid', 'Taco.model.Product'],
    title: 'Cart',
    initComponent: function () {
        var me = this;

        me.tbar = [
        {
            xtype: 'textfield',
            fieldLabel: 'SKU',
                name: 'sku',
                id: 'sku'
        },
        {
            xtype: 'button',
            text: 'Add',
                disabled: false,
                onClick: function () {
                    var sku = Ext.getCmp("sku").getValue();

                    var Product = Ext.ModelManager.getModel('Taco.model.Product');
                    Product.load(sku, {
                        bypassCache: true,
                        success: function(p) {
                            if (p !== null)
                            {
                                // TODO: check whether this product is already added and update quantity instead.
                                var orderitem = Ext.create('fakeOrderItem', {
                                    product: p,
                                    quantity: 1
                                });
                                me.store.add(orderitem);
                            }
                        }
                    });
                }
        },
        {
            xtype: 'button',
            text: 'Search'
        },
        '->',
        {
            xtype: 'button',
            text: 'Clear All'
        }
        ];

        Ext.define('fakeOrderItem', {
            extend: 'Ext.data.Model',
            fields: [
                { name: "product", type: "auto" },
                { name: "quantity", type: "int" }
            ]
        });

        // this store is like a cart. It contains the items we will add to our order.
        me.store = Ext.create('Ext.data.Store', {
            model: 'fakeOrderItem',
            data: []
        });

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
    }
});