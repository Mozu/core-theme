define(["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'hyprlivecontext',
    "modules/checkout/steps/views-base-checkout-step",
    'modules/editable-view',
    'modules/checkout/models-shipping-destinations'], 
    function ($, _, Hypr, Backbone, HyprLiveContext, CheckoutStepView, EditableView, ShippingDestinationModels) {

        
        var GiftCardDestinationView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/gift-card-destination',
            autoUpdate: [
                'email'
            ]
        });

        var ShippingDestinationContactView = Backbone.MozuView.extend({
            templateName: 'modules/common/address-form',
            requiredBehaviors: [1002],
            autoUpdate: [
                'firstName',
                'lastNameOrSurname',
                'address.address1',
                'address.address2',
                'address.address3',
                'address.cityOrTown',
                'address.countryCode',
                'address.stateOrProvince',
                'address.postalOrZipCode',
                'address.addressType',
                'phoneNumbers.home',
                'email'
            ],
            renderOnChange: [
                'address.countryCode'
            ]
        });

        var ShippingDestinationSingleView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-destination-single-address',
            requiredBehaviors: [1002],
            initialize: function(){
                var self = this;
                this.listenTo(this.model, 'saveSingleDestination', function() {
                    self.saveSingleDestination();
                });
            },
            saveSingleDestination: function(){

            },
            chooseCandidateAddress: function(e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.model.get('destinationContact').get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            }
        });
        
        var DeliveryDestinationView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/delivery-destination',
            requiredBehaviors: [1002],
            renderOnChange: [
                'fulfillmentInfoId',
                'fulfillmentContactId',
                'isLoading'
            ],
            additionalEvents: {
                "change [data-mz-fulfillment-contact]": "handleChangeDestinationAddress"
            },
            initialize: function(){
                var self = this;
                this.listenTo(this.model, 'addedNewDestination', function() {
                    self.render();
                });
                this.listenTo(this.model, 'changeDestination', function() {
                    self.render();
                }); 
                this.listenTo(this.model, 'destinationsUpdate', function() {
                    self.render();
                });
            },
            handleChangeDestinationAddress: function(e) {
                var self = this;

                var $target = $(e.currentTarget);
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");

                if ($target.val() === "" && !customerContactId) {
                    return false;
                }

                // All Delivery items will have same destination.
                // Hence update destination of all orderItems for delivery
                self.model.updateSingleCheckoutDestination($target.val(), customerContactId, true)
                    .ensure(function(){
                        self.render();
                    });
            },
            handleNewContact: function(e){
                this.model.set('editingDestination', true);
                this.model.addNewContact();
            },
            handleEditContact: function(e){
                var destinationId = this.model.get('destinationId');
                if(destinationId) {
                    this.model.editContact(destinationId);    
                }
            }
        });

        var ShippingDestinationItemView = Backbone.MozuView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-destinations-item',
            requiredBehaviors: [1002],
            additionalEvents: {
                "change [data-mz-fulfillment-contact]": "handleChangeDestinationAddress"
            },
            renderOnChange: [
                'fulfillmentInfoId',
                'fulfillmentContactId',
                'isLoading'
            ],
            initialize: function(){
                var self = this;
                this.listenTo(this.model, 'addedNewDestination', function() {
                    self.render();
                });
                this.listenTo(this.model, 'changeDestination', function() {
                    self.render();
                }); 
                this.listenTo(this.model, 'destinationsUpdate', function() {
                    self.render();
                });
            },
            handleChangeDestinationAddress: function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");

                if ($target.val() === "" && !customerContactId) {
                    return false;
                }

                self.model.updateOrderItemDestination($target.val(), customerContactId);
                self.render();
            },
            handleNewContact: function(e){
                this.model.set('editingDestination', true);
                this.model.addNewContact();
                //window.checkoutViews.contactDialog.openDialog();
                var self = this;
            },
            handleEditContact: function(e){
                var destinationId = this.model.get('destinationId');
                if(destinationId) {
                    //this.model.set('editingDestination', true);
                    this.model.editContact(destinationId);    
                }
            },
            handleSplitOrderItem: function(e){
                this.model.splitCheckoutItem();
            },
            handleRemoveDestination: function(e){
                var $target = $(e.currentTarget),
                    itemId = $target.parents('[data-mz-shipping-destinations-item]').data('mzItemId');

                this.model.removeDestination();
            }
        });

        // var ShippingDestinationView = Backbone.MozuView.extend({
        //     templateName: 'modules/multi-ship-checkout/shipping-destinations-items',
        //     requiredBehaviors: [1002],
        //     initialize: function(){
        //         var self = this;
        //         this.listenTo(this.model, 'addedNewDestination', function() {
        //             self.render();
        //         });
        //         this.listenTo(this.model, 'changeDestination', function() {
        //             self.render();
        //         });
        //         this.listenTo(this.model, 'destinationsUpdate', function() {
        //             self.render();
        //         });
        //     },
        //     render : function() {
        //         var self = this;
        //         Backbone.MozuView.prototype.render.apply(this, arguments);
        //         $.each(this.$el.find('[data-mz-shipping-destinations-item]'), function(index, val) {
        //             var shippingDestinationItemView = new ShippingDestinationItemView({
        //                 el: $(this),
        //                 model: self.model
        //             });
        //             shippingDestinationItemView.render();
        //         });  
        //     }
        // });

         var ComboShippingAddressView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-shipping-destinations',
            requiredBehaviors: [1002],
            renderOnChange: [
                'isMultiShipMode'
            ],
            additionalEvents: {
                "change [data-mz-single-fulfillment-contact]": "handleChangeSingleAddress"
            },
            isMultiShipMode: function(){
                if(this.model.isMultiShipMode()){
                    this.model.set('isMultiShipMode', true);
                } else {
                    this.model.set('isMultiShipMode', false);
                }
                return this.model.get('isMultiShipMode');
            },
            handleChangeSingleAddress: function(e){
                var self = this;
                var $target = $(e.currentTarget);
                var customerContactId = $target.find(":selected").data("mzCustomercontactid");
                
                if($target.val() === "" && !customerContactId) {
                    return false;
                }

                self.model.updateSingleCheckoutDestination($target.val(), customerContactId, false).ensure(function(){
                   //self.render(); 
                });
            },
            handleNewContact: function(e){
                this.model.set('editingDestination', true);
                this.model.addNewContact();
                //window.checkoutViews.contactDialog.openDialog();
                var self = this;
            },
            handleEditContact: function(e){
                var destinationId = $(e.target).data("mzDestinationid");

                this.model.get('destinationId');
                if(destinationId) {
                    //this.model.set('editingDestination', true);
                    this.model.editContact(destinationId);    
                }
            },
            initialize: function(){
                var self = this;
                this.listenTo(this.model.parent, 'sync', function() {
                    self.render();
                });
                this.listenTo(this.model.getDestinations(), 'destinationsUpdate', function() {
                    self.render();
                });
            },
            chooseCandidateAddress: function(e) {
                var idx = parseInt($(e.currentTarget).val(), 10);
                if (idx !== -1) {
                    var addr = this.model.getCheckout().get('destinations').singleShippingDestination().get('destinationContact').get('address');
                    var valAddr = addr.get('candidateValidatedAddresses')[idx];
                    for (var k in valAddr) {
                        addr.set(k, valAddr[k]);
                    }
                }
            },
            render: function(){
                var self = this;

                self.isMultiShipMode();

                this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
                EditableView.prototype.render.apply(this, arguments);
                this.resize();

                // Delivery Destination:
                // Find one item which has fulfillmentMethod as Delivery and pass that as model.
                var deliveryDestination = self.model.parent.get("items").models
                    .find(function(item) { 
                        return item.attributes.fulfillmentMethod === "Delivery";
                    });
                if (deliveryDestination) {
                    var deliveryDestinationView = new DeliveryDestinationView({
                        el: this.$el.find('[data-mz-delivery-destination]'),
                        model: deliveryDestination
                    });
                    deliveryDestinationView.render();
                }

                $.each(this.$el.find('[data-mz-shipping-destinations-item]'), function(index, val) {
                    var id = $(this).data('mzItemId');
                    var shippingDestination = self.model.parent.get("items").findWhere({'id': id});
                    var shippingDestinationView = new ShippingDestinationItemView({
                        el: $(this),
                        model: shippingDestination
                    });
                    shippingDestinationView.render();
                });

                $.each(this.$el.find('[data-mz-shipping-destination-single]'), function(index, val) {
                    var shippingDestination = self.model.getCheckout().get('destinations').singleShippingDestination();
                    if(!shippingDestination) {
                        shippingDestination = self.model.getCheckout().get('destinations').newDestination();
                    }
                    var shippingDestinationSingleView = new ShippingDestinationSingleView({
                        el: $(this),
                        model: shippingDestination
                    });
                    shippingDestinationSingleView.render();

                     $.each($(this).find('[data-mz-address-form]'), function(index, val) {
                        var shippingDestinationContactView = new ShippingDestinationContactView({
                            el: $(this),
                            model: shippingDestination.get('destinationContact')
                        });
                    shippingDestinationContactView.render();
                    });

                });

                $.each(this.$el.find('[data-mz-gift-card-destination]'), function(index, val) {
                    var giftCardDestination = self.model.getCheckout().get('destinations').findWhere({'isGiftCardDestination': true});
                    if(!giftCardDestination) {
                        giftCardDestination = self.model.getCheckout().get('destinations').newGiftCardDestination();
                    }
                    var giftCardDestinationView = new GiftCardDestinationView({
                        el: $(this),
                        model: giftCardDestination.get('destinationContact')
                    });
                    giftCardDestinationView.render();
                });
            }
        });
         
        return ComboShippingAddressView;
});