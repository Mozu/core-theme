define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/checkout/models-shipping-destinations',
    'modules/models-customer'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CheckoutStep, ShippingDestinationModels, CustomerModels) {

    var ShippingStep = CheckoutStep.extend({
        helpers : ['orderItems', 'selectableDestinations', 'selectedDestination', 'selectedDestinationsCount', 'totalQuantity', 'hasMultipleShipToHomeItems', 'hasShipToHomeAndDeliveryItems'],
        validation: this.multiShipValidation,
        digitalOnlyValidation: {
            fn: function(value, attr){
                var destinationErrors = [];

                var giftCardDestination = this.parent.get('destinations').find(function(destination, idx){
                    return (destination.get('isGiftCardDestination'));
                });

                destinationErrors = giftCardDestination.validate();

                return (destinationErrors) ? destinationErrors : false;
            }
        },
        singleShippingAddressValidation : {
            singleShippingAddess : {
                fn : function(value, attr){
                    var destination = this.parent.get('destinations').singleShippingDestination();
                    if(destination){
                        var instance = destination.get('destinationContact') instanceof CustomerModels.Contact;
                        if(!instance) {
                            destination.set('destinationContact',  new CustomerModels.Contact(destination.get('destinationContact')));
                        }
                        var destinationErrors = destination.get('destinationContact').validate();
                        return (destinationErrors) ? destinationErrors : false;
                    }
                    return true;
                }
            }
        },
        multiShipValidation : {
            ShippingDestinations :{
                fn: function(value, attr){
                    var destinationErrors = [];
                    this.parent.get('items').forEach(function(item, idx){
                        var itemValid = item.validate();
                        if (itemValid && item.get('fulfillmentMethod') === "Ship") {
                            destinationErrors.push(itemValid);
                        }
                    });
                    return (destinationErrors.length) ? destinationErrors : false;
                }
            }
        },
        getCheckout: function(){
            return this.parent;
        },
        initStep: function () {
            var self = this;
            if (self.requiresDigitalFulfillmentContact()) {
                var giftCardDestination = self.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                if(!giftCardDestination) {
                    giftCardDestination = self.getCheckout().get('destinations').newGiftCardDestination();
                    self.getDestinations().apiSaveDestinationAsync(giftCardDestination).then(function(data){
                        self.updateDigitalItemDestinations(data.data.id);
                    });
                }
                self.getCheckout().get('destinations').reset = function(models, options) {
                    var giftCardDestination = self.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                    if(giftCardDestination && !_.findWhere(models, {'isGiftCardDestination': true})) {
                        models.push(giftCardDestination);
                    }
                    Backbone.Collection.prototype.reset.apply(this, arguments);
                };
            }
            CheckoutStep.prototype.initStep.apply(this, arguments);
        },
        initialize : function() {
            //TO-DO: This is a work around for the api sync rerendering collections.
            // Replace before using in Prod
            var self = this;
        },
        // digitalGiftDestination :function() {
        //     //TO-DO : Primary Addresss select First
        //     var shippingDestinations = this.getCheckout().get('destinations');
        //     var dGDestination = shippingDestinations.findWhere({digitalGiftDestination: true});
        //     if(dGDestination){
        //         return dGDestination.toJSON();
        //     }
        //     return new ShippingDestinationModels.ShippingDestination({});
        // },
        orderItems : function(){
            return this.parent.get("items").sortBy('originalCartItemId');
        },
        splitCheckoutItem: function(itemId, quantity){
            //Move isLoading to SDK
            var self = this;
            self.isLoading(true);
            this.getCheckout().apiSplitCheckoutItem({itemId : itemId, quantity : quantity}).ensure(function(data){
                self.isLoading(false);
            });
        },

        selectableDestinations : function(){
           var selectable = [];
           this.getCheckout().get('destinations').each(function(destination){
                if(!destination.get('isGiftCardDestination')){
                    selectable.push(destination.toJSON());
                }
            });
            return selectable;
        },
        selectedDestinationsCount : function(){
            var shippingItems = this.parent.get("items").filter(function(item){ return (item.get('fulfillmentMethod') == "Ship" || item.get('fulfillmentMethod') == "Delivery"); });
            var destinationCount = _.countBy(shippingItems, function(item){
                return item.get('destinationId');
            });
            return _.size(destinationCount);
        },
        hasMultipleShipToHomeItems: function() {
            var totalQty = 0;
            this.parent.get("items").forEach(function(item){
                if (item.get("fulfillmentMethod") == "Ship") {
                    totalQty+=item.get("quantity");
                }
            });
            return totalQty > 1;
        },
        hasShipToHomeAndDeliveryItems: function() {
            var shippingItems = this.parent.get("items").filter(function(item){ return item.get('fulfillmentMethod') == "Ship"; });
            var deliveryItems = this.parent.get("items").filter(function(item){ return item.get('fulfillmentMethod') == "Delivery"; });
            return (shippingItems.length && deliveryItems.length);
        },
        totalQuantity: function(){
          var totalQty = 0;
          this.parent.get("items").forEach(function(item){
              totalQty+=item.get("quantity");
          });
          return totalQty;
        },
        selectedDestination : function(){
            var directShipItems = this.getCheckout().get('items').findWhere({fulfillmentMethod: "Ship"});
            var selectedId = "";

            if(directShipItems){
                selectedId = directShipItems.get('destinationId');
            } else {
                // find items with fulfillmentMethod as Delivery
                var deliveryItem = this.getCheckout().get('items').findWhere({fulfillmentMethod: "Delivery"});
                selectedId = deliveryItem.get('destinationId');
            }

            if(selectedId){
                return this.getCheckout().get('destinations').get(selectedId).toJSON();
            }
        },
        updateSingleCheckoutDestination: function(destinationId, customerContactId, isFulfillmentMethodDelivery){
            var self = this;
            self.isLoading(true);
            if(destinationId){
                return self.getCheckout().apiSetAllShippingDestinations({
                    destinationId: destinationId,
                    isFulfillmentMethodDelivery: isFulfillmentMethodDelivery
                }).ensure(function(){
                     self.isLoading(false);
                });
            }

            var destination = self.getCheckout().get('destinations').findWhere({customerContactId: customerContactId});
            if(destination){
                return destination.saveDestinationAsync().then(function(data){
                    return self.getCheckout().apiSetAllShippingDestinations({
                        destinationId: data.data.id,
                        isFulfillmentMethodDelivery: isFulfillmentMethodDelivery
                    }).ensure(function(){
                        self.isLoading(false);
                    });
                });
            }
        },
        addNewContact: function(){
            this.getCheckout().get('dialogContact').resetDestinationContact();
            this.getCheckout().get('dialogContact').unset('id');

            this.getCheckout().get('dialogContact').trigger('openDialog');
        },
        editContact: function(destinationId){
            var destination = this.getDestinations().findWhere({'id': destinationId});

            if(destination){
                var destCopy = destination.toJSON();
                destCopy = new ShippingDestinationModels.ShippingDestination(destCopy);
                //destCopy.set('destinationContact', new CustomerModels.Contact(destCopy.get('destinationContact')));
                //this.getCheckout().get('dialogContact').get("destinationContact").clear();
                this.getCheckout().set('dialogContact', destCopy);
                this.getCheckout().get('dialogContact').set("destinationContact", new CustomerModels.Contact(destCopy.get('destinationContact').toJSON()));
                this.getCheckout().get('dialogContact').trigger('openDialog');
            }
        },
        getDestinations : function() {
            return this.parent.get("destinations");
        },
        updateDigitalItemDestinations: function(destinationId){
            var self = this;
            var payload = [{
                destinationId: destinationId,
                itemIds: []
            }];
            var digitalItemIds = self.getCheckout().get('items').each(function(item){
                if(item.get('fulfillmentMethod') === "Digital") {
                    payload[0].itemIds.push(item.get('id'));
                }
            });
            if(digitalItemIds.length) {
                this.getCheckout().apiModel.updateCheckoutItemDestinationBulk({id: self.getCheckout().get('id'), postdata: payload});
            }
        },
        toJSON: function() {
                if (this.requiresFulfillmentInfo() || this.requiresDigitalFulfillmentContact()) {
                    return CheckoutStep.prototype.toJSON.apply(this, arguments);
                }
            },
            //Rename for clear
        //Rename for clear
        isDigitalValid: function() {
            var email = this.get('email');
            return (!email) ? false : true;
        },
        //Rename for clear
        // Breakup into seperate api update for fulfillment

        digitalGiftCardValid :function(){
            var self = this;
            self.validation = self.digitalOnlyValidation;

           var validationObj = self.validate();

            if (validationObj) {
                if (validationObj) {
                    Object.keys(validationObj.fn).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj.fn[key]
                        });
                    }, this);
                }
                return false;
            }
            return true;
        },
        saveDigitalGiftCard: function() {
            var self = this,
            checkout = self.getCheckout();

            if(self.digitalGiftCardValid()){
                var giftCardDestination = this.parent.get('destinations').find(function(destination, idx){
                    return (destination.get('isGiftCardDestination'));
                });

                if(giftCardDestination) {
                    if(!giftCardDestination.get('id')) {
                        self.getDestinations().apiSaveDestinationAsync(giftCardDestination).then(function(data){
                            self.updateDigitalItemDestinations(data.data.id);
                            //self.getCheckout.updateCheckoutItemDestinationBulk
                        });
                    } else {
                        self.getDestinations().apiUpdateShippingDestinationAsync(giftCardDestination).then(function(data){
                            self.updateDigitalItemDestinations(data.data.id);
                        });
                    }
                }
                return true;
            } else {
                return false;
            }
        },
        singleShippingAddressValid : function(){
            this.validation = this.singleShippingAddressValidation;
            var validationObj = this.validate();

            if (validationObj) {
                if (validationObj) {
                    Object.keys(validationObj.singleShippingAddess).forEach(function(key) {
                        this.trigger('error', {
                            message: validationObj.singleShippingAddess[key]
                        });
                    }, this);
                }
                return false;
            }
            return true;
        },
        nextSingleShippingAddress: function() {
            var self = this,
            checkout = this.getCheckout();

            if(this.singleShippingAddressValid()){
                if(this.selectableDestinations().length < 2) {
                    self.validateAddresses();
                } else {
                    self.completeStep();
                }
            }
        },
        validateAddresses : function(){

            var self = this;
            var checkout = this.parent;

            var isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;

            var shippingDestination = self.getDestinations().singleShippingDestination();
            var addr = shippingDestination.get('destinationContact').get('address');

            var scrubBillingContactId = function(){
                if(shippingDestination.get('id')) {
                    var isBilling = shippingDestination.get('id').toString().startsWith("billing_");
                    if(isBilling) {
                        shippingDestination.set('id', "");
                    }
                }
                return shippingDestination;
            };

            var saveAddress = function(){
                self.isLoading('true');
                scrubBillingContactId();

                if(!shippingDestination.get('id')) {
                    self.getDestinations().apiSaveDestinationAsync(shippingDestination).then(function(data){
                        self.getCheckout().apiSetAllShippingDestinations({destinationId: data.data.id}).then(function(){
                            self.completeStep();
                        });
                    });
                } else {
                    self.getDestinations().updateShippingDestinationAsync(shippingDestination).then(function(data){
                        self.getCheckout().apiSetAllShippingDestinations({destinationId: data.data.id}).then(function(){
                            self.completeStep();
                        });
                    });
                }
            };

            if (!isAddressValidationEnabled) {
                saveAddress();
            } else {
                if (!addr.get('candidateValidatedAddresses')) {
                    var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                    addr.syncApiModel();
                    checkout.messages.reset();
                    addr.apiModel[methodToUse]().then(function (resp) {
                        if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                            if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                addr.set('isValidated', true);
                                    saveAddress();
                                    return;
                                }
                            addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                            self.trigger('render');
                        } else {
                            saveAddress();
                        }
                    }, function (e) {
                        if (allowInvalidAddresses) {
                            // TODO: sink the exception.in a better way.
                            checkout.messages.reset();
                            saveAddress();
                        } else {
                            checkout.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                        }
                    });
                } else {
                    saveAddress();
                }
            }
        },
        calculateStepStatus: function() {

            if (!this.requiresFulfillmentInfo() && !this.requiresDigitalFulfillmentContact()) return this.stepStatus('complete');

            if (this.requiresDigitalFulfillmentContact()) {
                this.validation = this.digitalOnlyValidation;
                if(this.validate()) return this.stepStatus('incomplete');
            }

            if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                this.validation = this.singleShippingAddressValidation;
                if(this.validate()) return this.stepStatus('incomplete');
            }

            this.validation = this.multiShipValidation;

            if(!this.validate()) return this.stepStatus('complete');

            return CheckoutStep.prototype.calculateStepStatus.apply(this);
        },
        validateModel: function() {
                this.validation = this.multiShipValidation;
                var validationObj = this.validate();

                if(this.requiresDigitalFulfillmentContact()){
                     var digitalValid = this.digitalGiftCardValid();
                     if(!digitalValid) { return false; }
                }

                if (this.requiresFulfillmentInfo() && validationObj) {
                    if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                        this.singleShippingAddressValid();
                        return false;
                    }

                    Object.keys(validationObj.ShippingDestinations).forEach(function(key) {
                        Object.keys(validationObj.ShippingDestinations[key]).forEach(function(keyLevel2) {
                            this.trigger('error', {
                                message: validationObj.ShippingDestinations[key][keyLevel2]
                            });
                        }, this);
                    }, this);
                    return false;
                }
                return true;
            },
            completeStep : function(){
                var self = this;
                var checkout = self.getCheckout();

                checkout.messages.reset();
                checkout.syncApiModel();

                if (self.requiresDigitalFulfillmentContact()) {
                    if(!self.saveDigitalGiftCard()) {
                        return false;
                    }
                }

                if(self.requiresShippingMethod()){
                    self.isLoading(true);
                    checkout.get('shippingInfo').updateShippingMethods().then(function(methods) {
                        if(methods){
                            var defaults = checkout.get('shippingInfo').shippingMethodDefaults();
                            if(defaults.length){
                                checkout.get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                     self.getCheckout().get('shippingInfo').stepStatus('incomplete');
                                });
                            } else {
                                 self.getCheckout().get('shippingInfo').isLoading(false);
                                 self.getCheckout().get('shippingInfo').calculateStepStatus();
                            }
                        }
                    }).ensure(function(){
                        self.isLoading(false);
                        self.stepStatus('complete');
                        checkout.get('shippingInfo').calculateStepStatus();
                    });
                } else {
                    // if shippingMethod is not required, then set ShippingInfo(shipping method) step to complete.
                    // e.g. If all items are Delivery items or Delivery and Pickup
                    // then ShippingStep is required but ShippingInfo(shipping method) step is not required
                    self.stepStatus('complete');
                    self.getCheckout().get('shippingInfo').stepStatus('complete');
                    checkout.get('billingInfo').calculateStepStatus();
                }
            },
            // Breakup for validation
            // Break for compelete step
            next: function() {
                var self = this;


                if(self.requiresFulfillmentInfo()){
                    if (!this.isMultiShipMode() && this.getCheckout().get('destinations').nonGiftCardDestinations().length < 2) {
                        return self.nextSingleShippingAddress();
                    }

                    if (!self.validateModel()) {
                      return false;
                    }

                }

                self.completeStep();
            }
    });

    return ShippingStep;
});
