define(['underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product"], function (_, Backbone, Hypr, ProductModels) {

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
                ];
            }
            delete j.reason;
            delete j.quantity;
            delete j.comments;
            return j;
        }
    }),

    RMACollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'rmas',
        defaults: {
            pageSize: 5
        },
        relations: {
            items: Backbone.Collection.extend({
                model: RMA
            })
        }
    }),

    Order = Backbone.MozuModel.extend({
        mozuType: 'order',
        relations: {
            items: OrderItemsList
        }
    }),

    OrderCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'orders',
        defaults: {
            pageSize: 5
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
    });

    return {
        OrderItem: OrderItem,
        RMA: RMA,
        RMACollection: RMACollection,
        Order: Order,
        OrderCollection: OrderCollection
    };

});


