define(['shim!vendor/underscore>_', 'modules/backbone-mozu'], function(_, Backbone) {

    var CartItemProduct = Backbone.MozuModel.extend({
        initialize: function() {
            this.set({Url: "/product/" + this.get("ProductCode")})
        }
    }),

    CartItem = Backbone.MozuModel.extend({
        relations: {
            Product: CartItemProduct
        },
        validation: {
            Quantity: {
                min: 1
            }
        },
        dataTypes: {
            Quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        priceIsModified: function() {
            var price = this.get('UnitPrice');
            return price.BaseAmount != price.DiscountedAmount;
        },
        saveQuantity: function() {
            if (this.hasChanged("Quantity")) this.apiUpdateQuantity(this.get("Quantity"));
        },
        removeFromCart: function() {
            //this.apiModel.del();
            this.destroy({ wait: true });
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['IsEmpty','Count'],
        relations: {
            Items: Backbone.Collection.extend({
                model: CartItem
            })
        },
        
        initialize: function() {
            this.get("Items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);
        },
        IsEmpty: function() {
            return this.get("Items").length < 1;
        },
        Count: function() {
            return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        }
    });

    return {
        CartItem: CartItem,
        Cart: Cart
    };
});