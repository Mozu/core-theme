define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/models-customer',
    'modules/checkout/steps/models-base-checkout-step',
    'modules/modal-dialog'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CustomerModels, CheckoutStep, ModalDialog) {

    var ShippingDestination = Backbone.MozuModel.extend({
        relations: {
            destinationContact: CustomerModels.Contact
        },
        dataTypes: {
            destinationId: function(val) {
                return (val === 'new') ? val : Backbone.MozuModel.DataTypes.Int(val);
            }
        },
        validation: this.validationDefault,
        validationDefault : {
            'destinationId': function (value) {
                if (!value || typeof value !== "number") return Hypr.getLabel('passwordMissing');
            }
        },
        validationDigitalDestination : {
            "destinationContact.email" : {
                fn: function (value) {
                    if (!value || !value.match(Backbone.Validation.patterns.email)) return Hypr.getLabel('emailMissing');
                }
            }
        },
        initialize : function(){
            var self = this;
            //We do not persit a Gift Card Destination Flag
            //Instead we determine from the bloew checks and set Validation and Flag for a Gift Card Destination here
            if(self.get('destinationContact').get('email') && !self.get('destinationContact').get('address').get('address1')){
                self.validation = self.validationDigitalDestination;
                self.set('isGiftCardDestination', true);
            }
        },
        getCheckout : function(){
            return this.collection.parent;
        },
        validateDigitalDestination: function(){
            this.validation = this.validationDigitalDestination();
            var validationErrors =  this.validate();

            this.validation = this.validationDefault;

            return validationErrors;
        },
        selectedFulfillmentAddress : function(){
            var self = this;
            return self.collection.pluck("id");
        },
        removeDestination: function(lineId, id){
            var self = this;
            self.get(lineId).get('items').remove(id);
        },
        isDestinationSaved: function(){
            return (this.get('id')) ? true : false;
        },
        saveDestinationAsync: function(){
            var self = this;
            return self.collection.apiSaveDestinationAsync(self).then(function(data){
                self.trigger('sync');
                return data;
            });
        }
    });

    var ShippingDestinations = Backbone.Collection.extend({
         model : ShippingDestination,
         validation: {
            ShippingDestination : "validateShippingDestination"
        },
        validateShippingDestination : function(value, attr, computedState){
            var itemValidations =[];
            this.collection.each(function(item,idx){
                var validation = item.validate();
                if(validation.ShippingDestinationItem.length) itemValidations = itemValidations.concat(validation.ShippingDestinationItem);
            });
            return (itemValidations.length) ? itemValidations : null; 
        },
        getCheckout : function(){
            return this.parent;
        },
        newDestination : function(contact, isCustomerAddress, customerContactType){
            var destination = {destinationContact : contact || new CustomerModels.Contact()};

            if(isCustomerAddress && contact.get('id')){
               destination.customerContactId = contact.get('id');
            }

            if(customerContactType){
                destination.customerContactType = customerContactType;
                if(customerContactType === "Billing" && !destination.id){
                    destination.id = _.uniqueId("billing_");
                }
            }

            var shippingDestination = new ShippingDestination(destination);
            this.add(shippingDestination);
            return shippingDestination;
        },
        newGiftCardDestination : function(){
            var self = this;
            var user = require.mozuData('user');
            var destination = {destinationContact : new CustomerModels.Contact({})};
            var giftCardDestination = new ShippingDestination(destination);

            giftCardDestination.validation = giftCardDestination.validationDigitalDestination;
            giftCardDestination.set('isGiftCardDestination', true);

            if (user.isAuthenticated) {
                giftCardDestination.get('destinationContact').set('email', user.email);
            }

            self.add(giftCardDestination);
            return giftCardDestination;
        },
        nonGiftCardDestinations : function(){
            var destinations = this.filter(function(destination, idx){
                return !destination.get('isGiftCardDestination');
            });
            return destinations;
        },
        singleShippingDestination : function(){
            var self = this;
            var shippingDestinations = this.nonGiftCardDestinations();
            var destination = "";

            if(!shippingDestinations.length) {
                destination = this.newDestination();
                destination.set('isSingleShipDestination', true);
            }
 
            if(!destination) {
                destination = this.find(function(destination, idx){
                    return (destination.get('isSingleShipDestination'));
                });
            }

            if(!destination) {
                destination = shippingDestinations[0];
            } 

            
            return destination;
        },
        hasDestination: function(destinationContact){
            var self = this;
            var foundDestination = self.find(function(destination){
                return self.compareAddressObjects(destination.get('destinationContact').get('address').toJSON(), destinationContact.get('address').toJSON());
            });
            return (foundDestination) ? foundDestination : false;
        },
        compareAddressObjects: function(obj1, obj2) {
            var areEqual = _.isMatch(obj1, {
                address1 : obj2.address1,
                addressType : obj2.addressType,
                cityOrTown : obj2.cityOrTown,
                countryCode : obj2.countryCode,
                postalOrZipCode : obj2.postalOrZipCode,
                stateOrProvince : obj2.stateOrProvince
            });
            return areEqual;
        },
        apiSaveDestinationAsync : function(destination){
            var self = this;
            return self.getCheckout().apiModel.addShippingDestination({DestinationContact : destination.get('destinationContact').toJSON()});
        },
        saveShippingDestinationAsync: function(destination){
            var self = this;
            return self.apiSaveDestinationAsync(destination).then(function(data){
                self.add(data.data);
                return data;
            });
        },
        updateShippingDestinationAsync : function(destination){
            var self = this;
            return self.apiUpdateShippingDestinationAsync(destination).then(function(data){
                var entry = self.findWhere({id: data.data.id});
                    if(entry) {
                        //var mergedDestinationContact = _.extend(entry.get('destinationContact'),  data.data.destinationContact);
                        entry.set('destinationContact', data.data.destinationContact); 
                        self.trigger('sync');
                        self.trigger('destinationsUpdate');
                    }
                return data;
            });
        },
        apiUpdateShippingDestinationAsync: function(destination){
            var self = this;
            var dest = destination.toJSON();
            dest.destinationId = dest.id;
            dest.checkoutId = this.getCheckout().get('id');
            return self.getCheckout().apiModel.updateShippingDestination(dest).then(function(data){
                return data;
            });
        }        
    });
   
    return {
        ShippingDestinations: ShippingDestinations,
        ShippingDestination : ShippingDestination
    };
});