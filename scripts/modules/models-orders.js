define(['shim!vendor/underscore>_', "modules/backbone-mozu", "hyprlive", "modules/models-product", "modules/mixin-paging"], function (_, Backbone, Hypr, ProductModels, PagingMixin) {

    var OrderItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        }
    }),

    OrderItemsList = Backbone.Collection.extend({
        model: OrderItem
    }),

    RMA = Backbone.MozuModel.extend({
        mozuType: 'rma',
        relations: {
            items: OrderItemsList
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        defaults: {
            returnType: 'Refund'
        },
        validation: {
            reason: {
                required: true,
                msg: Hypr.getLabel('enterReturnReason')
            },
            quantity: {
                min: 1,
                msg: Hypr.getLabel('enterReturnQuantity')
            },
            comments: {
                fn: function (value) {
                    if (this.attributes.reason === "Other" && !value) return Hypr.getLabel('enterOtherComments');
                }
            }
        },
        // in GA you can only return one item at a time, but this will have to change at some point
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j.reason && j.quantity && j.items && j.items[0] && !j.items[0].reason) {
                j.items[0].reasons = [
                    {
                        reason: j.reason,
                        quantity: j.quantity
                    }
                ];
                if (j.comments) j.items[0].notes = [
                    {
                        text: j.comments
                    }
                ]
            }
            delete j.reason;
            delete j.quantity;
            delete j.comments;
            return j;
        }
    }),

    RMACollection = Backbone.MozuModel.extend(_.extend({
        mozuType: 'rmas',
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
                model: RMA
            })
        }
    }, PagingMixin)),

    Order = Backbone.MozuModel.extend({
        mozuType: 'order',
        relations: {
            items: OrderItemsList
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
                model: Order
            }),
            rma: RMA
        },
        startReturn: function (orderId, itemId) {
            var rma = this.get('rma');
            var item = this.get('items').get(orderId).get('items').get(itemId);
            if (item) {
                item = item.toJSON();
                item.orderItemId = item.id;
                rma.get('items').reset([item]);
                rma.set({
                    originalOrderId: orderId,
                    returnType: 'Refund'
                });
            }
        },
        clearReturn: function() {
            var rma = this.get('rma');
            rma.clear();
        },
        finishReturn: function (id) {
            var self = this, op;
            if (!this.validate()) {
                this.isLoading(true);
                op = this.get('rma').apiCreate();
                if (op) return op.then(function (rma) {
                    self.isLoading(false);
                    self.trigger('returncreated', rma.prop('id'));
                    self.clearReturn();
                    return rma;
                }, function () {
                    self.isLoading(false);
                });
            }
        }
    }, PagingMixin));

    return {
        OrderItem: OrderItem,
        RMA: RMA,
        RMACollection: RMACollection,
        Order: Order,
        OrderCollection: OrderCollection
    };

});


