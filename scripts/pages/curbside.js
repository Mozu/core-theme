define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api'
],
    function ($, _, Hypr, Backbone, api) {

var CurbsideCustomerModel = Backbone.MozuModel.extend({
    mozuType: 'curbside', //This is a reference to the JS SDK object
    onDeliveryMethodSubmit: function(payload){
        var self = this;
        return api.action('customer', 'orderCurbsideEvent', payload);
    }
});


var CurbsideCustomerView = Backbone.MozuView.extend({
    templateName: "back-office/customer-at-curbside-content",
    autoUpdate: [ //These are two way bindings from model to inputs on your template
        'vehicleModel',
        'parkingSpotText',
        'deliveryMethod'
    ], 
    onDeliveryMethodSubmit: function(e) {
        // Here you could use e.element to search the dom and get any data we need.
        // Since we have hooked to autoUpdate no need.

        var self = this,
            $target = $(e.currentTarget);

            //Our payload is kinda odd for this request. Normally we would not have to manually create the payload 
            // The request would just use the data in the model.
            var payload ={
                orderNumber: self.model.get('orderNumber'),
                orderId: self.model.get('orderId'),
                shipmentNumber: self.model.get('shipmentNumber'),
                CurbsideFormData: {
                    'vehicleModel': self.model.get('vehicleModel'),
                    'parkingSpotText': self.model.get('parkingSpotText'),
                    'deliveryMethod' : self.model.get('deliveryMethod')
                }
            };

        this.model.onDeliveryMethodSubmit(payload).then(function(){

            self.render();
            //Do after request stuff here.
        });
    },
    render: function(){
        //Do things before component render here

        Backbone.MozuView.prototype.render.apply(this, arguments);

        //Do things after component render here
    }

});


$(document).ready(function () {
    var crubsideModel = new CurbsideCustomerModel(require.mozuData("curbside") || {});
    var crubSideView = new CurbsideCustomerView({
        el: $('#mz-customer-at-curbside-content'),
        model: crubsideModel
    });

    crubSideView.render();
});

});

