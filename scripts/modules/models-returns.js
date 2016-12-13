define(["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product"], function (api, _, Backbone, Hypr, ProductModels) {
 var ReturnableItems = Backbone.MozuModel.extend({
        relations: { 
        },
        _returnableItems: [],
        getReturnableItems: function(){
            return _.filter(this._returnableItems, function(item) { 
                var method = (item.fulfillmentMethod) ? item.fulfillmentMethod : item.parent.fulfillmentMethod;
                return method !== "Digital"; 
            });
        },
        fetchReturnableItems: function(){
            var self = this,
            op = self.apiGetReturnableItems();
            self.isLoading(true);
            return op.then(function (data) {
                self.isLoading(false);
                return data;
            }, function () {
                self.isLoading(false);
            });
        }
    }),
    RMAItem = Backbone.MozuModel.extend({
        relations: {
            //item: OrderItem
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },

        _validation: {
            rmaReason: {
                required: true,
                msg: Hypr.getLabel('enterReturnReason')
            },
            rmaQuantity: {
                min: 1,
                msg: Hypr.getLabel('enterReturnQuantity')
            },
            rmaComments: {
                fn: function (value) {
                    if (this.attributes.reason === "Other" && !value) return Hypr.getLabel('enterOtherComments');
                }
            }
        },
        initialize: function() {
            var set = this;
        },
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if(j.rmaReturnType) {
              j.returnType = j.rmaReturnType;
            }
            if (j && j.rmaReason && j.rmaQuantity) {
                    j.reasons = [
                    {
                        reason: j.rmaReason,
                        quantity: j.rmaQuantity
                    }
                ];
                if (j.rmaComments) j.notes = [
                    {
                        text: j.rmaComments
                    }
                ];
            }
            delete j.rmaReason;
            delete j.rmaQuantity;
            delete j.rmaComments;
            delete j.rmaReturnType;
            return j;
        }
    }),
    RMA = Backbone.MozuModel.extend({
        mozuType: 'rma',
        relations: {
            items: Backbone.Collection.extend({
               model: RMAItem 
            })
        },
        defaults: {
            returnType: 'Refund'
        },
        validateActiveReturns: function(){
            var self = this,
            errors = [];
            this.get('items').each(function(item, key) {
                item.validation = item._validation;
                if (item.get('isSelectedForReturn')){
                    if(!item.validate()) errors.push(item.validate());
                }
            });
            if(errors.length > 0) {
              return errors;  
            }
            return false;
        },
        toJSON: function () {
            var self = this,
            jsonItems = [];
            this.get('items').each(function(item){
                jsonItems.push(item.toJSON());
            });
            this.set('items', jsonItems);
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
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
        },
        getReturnItemsByOrderId : function(orderId){
            var self = this;
            var rmaReturns = self.get('items').where(function(rma){
                return rma.get('originalOrderId') === orderId;
            });
            return rmaReturns;
        }
    });
    return {
        ReturnableItems: ReturnableItems,
        RMA: RMA,
        RMACollection: RMACollection
    };
});