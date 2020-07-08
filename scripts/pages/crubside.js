define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api'
],
    function ($, _, Hypr, Backbone, api) {

var CrubsideCustomerModel = Backbone.MozuModel.extend({
    mozuType: 'crubside', //This is a reference to the JS SDK object
    onDeliveryMethodSubmit: function(payload){
        var self = this;
        return api.action('customer', 'orderCurbsideEvent', payload);
    }
});


var CrubsideCustomerView = Backbone.MozuView.extend({
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
            e.preventDefault();
            var isBackofficePreview = $('[data-mz-isBackofficePreview]').val();
            var payload ={
                orderNumber: self.model.get('orderNumber'),
                orderId: self.model.get('orderId'),
                shipmentNumber: self.model.get('shipmentNumber'),
                CurbsideFormData: [
                    {
                
                        key: $('#parkingspotlabel').text(),
                        value: $('[data-mz-parkingspotText]').val()
                    },
                    {
                        key: $('#vehiclemodelLabel').text(),
                        value: $('[data-mz-vehiclemodel]').val()
                    },
                    {
                        key: $('#deliverymethodlabel').text(),
                        value: $('[data-mz-deliverymethod]').val()
                    }
                ]
            };
             // if it is preview then blocking the acutal call and redirecting to qrcode.
            if(isBackofficePreview === 'True'){
                window.location.href = window.location.pathname + '-qrcode';
              }
              else {

                this.model.onDeliveryMethodSubmit(payload).then(function(respnse){
                    self.model.set('hasCurbsideData', respnse.data.hasCurbsideData);
                    self.model.set('qrCode',respnse.data.qrCode)
                    self.render();

                });
    }
    },
    render: function(){
        //Do things before component render here

        Backbone.MozuView.prototype.render.apply(this, arguments);

        //Do things after component render here
    }

});


$(document).ready(function () {
    var crubsideModel = new CrubsideCustomerModel(require.mozuData("curbside") || {});
    var crubSideView = new CrubsideCustomerView({
        el: $('#mz-customer-at-curbside-content'),
        model: crubsideModel

    });

    crubSideView.render();
});

});

