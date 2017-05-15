define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api',
    'hyprlivecontext'
],
function ($, _, Hypr, Backbone, api, HyprLiveContext) {

    var CheckoutStep = Backbone.MozuModel.extend({
        helpers: ['stepStatus', 'requiresFulfillmentInfo', 'requiresDigitalFulfillmentContact', 'isMultiShipMode'],  //
        // instead of overriding constructor, we are creating
        // a method that only the CheckoutStepView knows to
        // run, so it can run late enough for the parent
        // reference in .getOrder to exist;

        initStep: function () {
            var me = this;
            this.next = (function(next) {
                return _.debounce(function() {
                    if (!me.isLoading()) next.call(me);
                }, 750, true);
            })(this.next);
            var order = me.getOrder();
            me.calculateStepStatus();
            me.listenTo(order, 'error', function () {
                if (me.isLoading()) {
                    me.isLoading(false);
                }
            });
            me.set('orderId', order.id);
            if (me.apiModel) me.apiModel.on('action', function (name, data) {
                if (data) {
                    data.orderId = order.id;
                } else {
                    me.apiModel.prop('orderId', order.id);
                }
            });
        },
        calculateStepStatus: function () {
            // override this!
            var newStepStatus = this.isValid(!this.stepStatus()) ? 'complete' : 'invalid';
            return this.stepStatus(newStepStatus);
        },
        getOrder: function () {
            return this.parent;
        },
        getCheckout: function () {
            return this.parent;
        },
        stepStatus: function (newStatus) {
            if (arguments.length > 0) {
                this._stepStatus = newStatus;
                this.trigger('stepstatuschange', newStatus);
            }
            return this._stepStatus;
        },
        requiresFulfillmentInfo: function () {
            return this.getOrder().get('requiresFulfillmentInfo');
        },
        requiresDigitalFulfillmentContact: function () {
            return this.getOrder().get('requiresDigitalFulfillmentContact');
        },
        edit: function () {
            this.stepStatus('incomplete');
        },
        next: function () {
            if (this.submit()) this.isLoading(true);
        },
        isMultiShipMode: function(){
            return this.parent.get('isMultiShipMode');
        },
        toggleMultiShipMode : function() {
            var self = this;
            self.parent.syncApiModel();
            if(this.parent.get('isMultiShipMode')){
                this.parent.apiModel.unsetAllShippingDestinations().then(function(){
                    self.parent.set('isMultiShipMode', false);
                    self.trigger('sync');
                });

                return;
            }
            this.parent.set('isMultiShipMode', true);
        }
    });
    return CheckoutStep;
});