define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext',
    'modules/checkout/steps/models-base-checkout-step'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext, CheckoutStep) {

    var FulfillmentInfo = CheckoutStep.extend({ 
            helpers : ['groupings'],
            validation: {
                ShippingMethods :{
                    fn: function(value, attr){
                        var shippingErrors = [];
                        this.parent.get('groupings').forEach(function(item, idx){
                            var itemValid = item.validate();
                            if (itemValid) {
                                shippingErrors.push(itemValid);
                            }
                        });
                        return (shippingErrors.length) ? shippingErrors : false;
                    }
                }
            },
            getCheckout: function() {
                return this.parent;
            },
            groupings : function(){
                var groups = [];
                this.getCheckout().get('groupings').each(function(group){ 
                    groups.push(group.toJSON({ helpers: true }));
                });
                return groups;
            },
            refreshShippingMethods: function (methods) {
                if(this.parent.get('shippingMethods')) {
                    this.parent.get('shippingMethods').reset();
                    this.parent.get('shippingMethods').add(methods);
                    return;
                }
                this.parent.set('shippingMethods', methods);
            },
            updateShippingMethods : function(){
                var self = this;
                return this.getCheckout().apiGetAvaiableShippingMethods().then(function (methods) {
                    self.refreshShippingMethods(methods);
                    return methods;
                    //self.trigger('shippingInfoUpdated');     
                    //self.calculateStepStatus();
                });
            },
            //
            //Break  this guy up we need to be able to return a promise to determine when to calculate Step status.
            //
            //
            //
            shippingMethodDefaults:function(){
                var self = this;

                var shippingMethodDefaults = [];
                self.getCheckout().get('groupings').each(function(group){

                    var methods = self.getCheckout().get('shippingMethods').findWhere({groupingId :group.id});

                    if(methods){
                        if(group.get('shippingMethodCode')){
                            var selectedMethod = _.findWhere(methods.get('shippingRates'), {shippingMethodCode :group.get('shippingMethodCode')});
                            if(selectedMethod) { return; } 
                        }
                        var lowestShippingRate = _.min(methods.get('shippingRates'), function(method){return method.price;});
                        shippingMethodDefaults.push({groupingId: group.id, shippingRate: lowestShippingRate});
                    }
                });
                return shippingMethodDefaults;
            },
            setDefaultShippingMethodsAsync : function(shippingMethodsPayload){
                var self = this;
                if (typeof(shippingMethodsPayload) !== 'object') shippingMethodsPayload = [];

                self.getCheckout().get('shippingInfo').isLoading(true);
                return self.getCheckout().apiSetShippingMethods({id: self.getCheckout().get('id'), postdata: shippingMethodsPayload}).ensure(function(){
                    self.isLoading(false);
                    self.getCheckout().get('shippingInfo').isLoading(false);
                });
            },
            validateModel: function() {
                var validationObj = this.validate();

                if (validationObj) {
                    Object.keys(validationObj.ShippingMethods).forEach(function(key) {
                        Object.keys(validationObj.ShippingMethods[key]).forEach(function(keyLevel2) {
                            this.trigger('error', {
                                message: validationObj.ShippingMethods[key][keyLevel2]
                            });
                        }, this);
                    }, this);

                    return false;
                }
                return true;
            },
            calculateStepStatus: function () {
                // If no shipping required, we're done.
                if (!this.requiresFulfillmentInfo()) return this.stepStatus('complete');

                // If there's no shipping address yet, go blank.
                if (this.parent.get('shippingStep').stepStatus() !== 'complete') {
                    return this.stepStatus('new'); 
                }

                if(this.validate()) {
                   return this.stepStatus('incomplete'); 
                }

                // Incomplete status for shipping is basically only used to show the Shipping Method's Next button,
                // which does nothing but show the Payment Info step.
                // var billingInfo = this.parent.get('billingInfo');
                 if (!this.parent.get('billingInfo') || this.parent.get('billingInfo').stepStatus() === 'new') return this.stepStatus('incomplete');

                // Payment Info step has been initialized. Complete status hides the Shipping Method's Next button.
                return CheckoutStep.prototype.calculateStepStatus.apply(this);
            },
            next: function () {
                if(!this.validateModel()) {
                   return false; 
                }

                this.stepStatus('complete');
                this.parent.get('billingInfo').calculateStepStatus();
            }
        });
    return FulfillmentInfo;
});