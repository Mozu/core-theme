define(["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'hyprlivecontext',
    "modules/checkout/steps/views-base-checkout-step",
    'modules/editable-view'], 
    function ($, _, Hypr, Backbone, HyprLiveContext, CheckoutStepView, EditableView) {
        var SingleShippingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/shipping-methods',
            renderOnChange: [
                'availableShippingMethods'
            ],
            additionalEvents: {
                "change [data-mz-shipping-method]": "updateShippingMethod"
            },
            updateShippingMethod: function (e) {
                this.model.updateShippingMethod(this.$('[data-mz-shipping-method]:checked').val());
            }
        });

        var MultiShippingInfoView = CheckoutStepView.extend({
            templateName: 'modules/multi-ship-checkout/step-shipping-methods',
            renderOnChange: [
                'availableShippingMethods'
            ],
            additionalEvents: {
                "change [data-mz-shipping-method]": "updateGroupingShippingMethod"
            },
             initialize: function(){
                var self = this;
                this.listenTo(this.model, 'shippingInfoUpdated', function() {
                    self.render(); 
                });
            },
            initStepView: function(){
                var self = this;
                 self.model.isLoading(true);
                CheckoutStepView.prototype.initStepView.apply(this, arguments);
                this.model.getCheckout().get('shippingStep').calculateStepStatus();
                if(this.model.getCheckout().get('requiresFulfillmentInfo') && this.model.getCheckout().get('shippingStep').stepStatus() == "complete") {
                    if(!this.model.getCheckout().get('shippingMethods').length) {
                        this.model.updateShippingMethods().then(function(){
                            var defaults = self.model.shippingMethodDefaults();
                            if(defaults.length){
                                self.model.getCheckout().get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                    self.model.calculateStepStatus();
                                    self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                    self.model.isLoading(false);
                                });
                            } else {
                                 self.model.calculateStepStatus();
                                 self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                 self.model.isLoading(false);
                            }
                        }, function(){
                            self.model.isLoading(false);
                            self.model.calculateStepStatus();
                        });
                    } else {
                        var defaults = self.model.shippingMethodDefaults();
                        if(defaults.length){
                            self.model.getCheckout().get('shippingInfo').setDefaultShippingMethodsAsync(defaults).ensure(function(){
                                self.model.calculateStepStatus();
                                self.model.getCheckout().get('billingInfo').calculateStepStatus();
                                self.model.isLoading(false);
                            });
                        } else {
                             
                             self.model.calculateStepStatus();
                             self.model.getCheckout().get('billingInfo').calculateStepStatus();
                             self.model.isLoading(false);
                        }
                    }

                }
            },
            updateGroupingShippingMethod: function(e) {
                var self = this;
                self.model.isLoading(true);
                var groupingId = $(e.currentTarget).attr('data-mz-grouping-id');
                var grouping = self.model.getCheckout().get('groupings').findWhere({id: groupingId});
                var shippingRates = self.model.getCheckout().get('shippingMethods').findWhere({groupingId: groupingId}).get('shippingRates');

                var shippingRate = _.findWhere(shippingRates, {shippingMethodCode: $(e.currentTarget).val()});
                grouping.set('shippingRate', shippingRate);
                grouping.set('shippingMethodCode', shippingRate.shippingMethodCode);
                self.model.getCheckout().syncApiModel();

                if(!$(e.currentTarget).selected) {
                    self.model.getCheckout().apiSetShippingMethod({groupId: groupingId, shippingRate: shippingRate}).ensure(function(){
                        self.model.isLoading(false);
                    });
                    // self.model.getCheckout().apiSetShippingMethods().then(function(){

                    // });
                }
            },
            render: function(){
                var self = this;
                this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
                //this.model.initSet();
                // var hasDestinations = self.model.getCheckout().get('items').filter(function(item){
                //     return item.get('destinationId');
                // });
                // if(self.model.getCheckout().get('groupings').length && !self.model.getCheckout().get('shippingMethods').length && hasDestinations.length == self.model.getCheckout().get('items').length) {
                //     self.model.getCheckout().apiModel.getAvaiableShippingMethods().then(function (methods) {
                //         self.model.refreshShippingMethods(methods);
                //         self.model.shippingInfoUpdated();
                //         //self.calculateStepStatus();
                //         //self.isLoading(false);
                //     });   
                // }

                EditableView.prototype.render.apply(this, arguments);
                this.resize();
            }
        });

        return MultiShippingInfoView;
});