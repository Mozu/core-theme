define(['modules/backbone-mozu','hyprlive', 'modules/jquery-mozu','underscore', 'hyprlivecontext', 'modules/views-modal-dialog'], function(Backbone, Hypr, $, _, HyprLiveContext, ModalDialogView, CustomerModels) {

    var ContactModalContactView = Backbone.MozuView.extend({
        templateName : "modules/multi-ship-checkout/address-dialog",
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
                'contactId',
                'email'
            ],
            renderOnChange: [
                'address.countryCode'
            ],
        choose: function(e) {
            var idx = parseInt($(e.currentTarget).val(), 10);
            if (idx !== -1) {
                var addr = this.model.get('address');
                var valAddr = addr.get('candidateValidatedAddresses')[idx];
                for (var k in valAddr) {
                    addr.set(k, valAddr[k]);
                }
            }
        }
    });

	var ContactModalView = ModalDialogView.extend({
	   templateName : "modules/multi-ship-checkout/modal-contact",
       handleDialogOpen : function(){
            this.setInit();
            this.model.trigger('dialogOpen');
            this.bootstrapInstance.show();
        },
		handleDialogSave : function(){
            var self = this;
            var checkout = this.model.parent;

             var scrubBillingContactId = function(){
                if(self.model.get('id')) {
                    var isBilling = self.model.get('id').toString().startsWith("billing_");
                    if(isBilling) {
                        self.model.set('id', "");    
                    }
                }
                return self.model;
            };
             

            var saveBillingDestination = function(){
                self.model.messages.reset();
                scrubBillingContactId();
                if(self.model.get('id')) {
                    checkout.get('destinations').get(self.model.get('id')).set('destinationContact',self.model.get('destinationContact'));
                } else {
                    checkout.get('destinations').newDestination(self.model.get('destinationContact'), true, "Billing");
                }
                checkout.get('billingInfo').updateBillingContact(self.model.get('destinationContact'));
                self.model.trigger('closeDialog');
            };


            if(this.model.get('destinationContact').validate()) return false;
            if(this.model.get('destinationContact').get('isBillingAddress')) {

                //checkout.get('destinations').newDestination(this.model.get('destinationContact'));
                saveBillingDestination();
                return;
            }


			var isAddressValidationEnabled = HyprLiveContext.locals.siteContext.generalSettings.isAddressValidationEnabled,
                    allowInvalidAddresses = HyprLiveContext.locals.siteContext.generalSettings.allowInvalidAddresses;

            var addr = this.model.get('destinationContact').get('address');

            var saveShippingDestination = function(){
              self.model.messages.reset();
              scrubBillingContactId();
                if(self.model.get('id')) {
                        self.model.parent.get('destinations').updateShippingDestinationAsync(self.model).ensure(function () {
                             self.model.trigger('closeDialog');
                        });
                } else {
                    self.model.parent.get('destinations').saveShippingDestinationAsync(self.model).then(function(data){
                        var item = checkout.get('items').findWhere({editingDestination: true});
                        if(!item){
                            item = checkout.get('items').at(0);
                        }
                        item.isLoading(true);
                        item.updateOrderItemDestination(data.data.id).then(function(){
                            item.set('editingDestination', false);
                            self.trigger('destinationsUpdate');
                            item.isLoading(false);
                        });
                    }).ensure(function () {
                         self.model.trigger('closeDialog');
                    });
                }
            };

			if(!this.model.validate()) {
            	if (!isAddressValidationEnabled) {
                    saveShippingDestination();
                } else {
                    if (!addr.get('candidateValidatedAddresses')) {
                        var methodToUse = allowInvalidAddresses ? 'validateAddressLenient' : 'validateAddress';
                        addr.syncApiModel();
                        self.model.messages.reset();
                        addr.apiModel[methodToUse]().then(function (resp) {
                            if (resp.data && resp.data.addressCandidates && resp.data.addressCandidates.length) {
                                if (_.find(resp.data.addressCandidates, addr.is, addr)) {
                                    addr.set('isValidated', true);
                                        saveShippingDestination();
                                        return;
                                    }
                                addr.set('candidateValidatedAddresses', resp.data.addressCandidates);
                                self.render();
                            } else {
                                //completeStep();

                                saveShippingDestination();
                            }
                        }, function (e) {
                            if (allowInvalidAddresses) {
                                // TODO: sink the exception.in a better way.
                                self.model.messages.reset();
                                saveShippingDestination();
                            } else {
                                self.model.messages.reset({ message: Hypr.getLabel('addressValidationError') });
                            }
                        });
                    } else {
                        saveShippingDestination();
                    }
                }
			}
		},
        setInit : function(){
            var self = this;
            $.each(this.$el.find('[data-mz-contact-modal-content]'), function(index, val) {

                var contactModalContactView = new ContactModalContactView({
                    el: $(this),
                    model: self.model.get('destinationContact')
                });
                contactModalContactView.render();
            });
        },

        render : function() {
            var self = this;
            self.setInit();
            //Backbone.MozuView.prototype.render.apply(this, arguments);

            // $.each(this.$el.find('[data-mz-contact-modal-content]'), function(index, val) {

            //     var contactModalContactView = new ContactModalContactView({
            //         el: $(this),
            //         model: self.model.get('contact')
            //     });
            //     contactModalContactView.render();
            // });
        }
	});

	return ContactModalView;
});
