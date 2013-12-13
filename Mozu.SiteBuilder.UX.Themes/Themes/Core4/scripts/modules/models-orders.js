define(['shim!vendor/underscore>_', "modules/backbone-mozu", "modules/models-product", "modules/mixin-paging"], function (_, Backbone, ProductModels, PagingMixin) {

    var OrderItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    OrderCollection = Backbone.MozuModel.extend(_.extend({
        mozuType: 'orders',
        validation: {
            pageSize: { min: 1 },
            pageCount: { min: 1 },
            startIndex: { min: 0 }
        },
        defaults: {
            pageSize: 5
        },
        dataTypes: {
            pageSize: Backbone.MozuModel.DataTypes.Int,
            pageCount: Backbone.MozuModel.DataTypes.Int,
            startIndex: Backbone.MozuModel.DataTypes.Int,
            totalCount: Backbone.MozuModel.DataTypes.Int,
        },
        relations: {
            items: Backbone.Collection.extend({
                model: OrderItem
            })
        },
    }, PagingMixin));

    return {
        OrderItem: OrderItem,
        OrderCollection: OrderCollection
    };

});


