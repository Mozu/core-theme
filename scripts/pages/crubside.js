define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api'
],
    function ($, _, Hypr, Backbone, api) {

var CrubsideCustomerModel = Backbone.MozuModel.extend({
    mozuType: 'crubside',
    onDeliveryMethodSubmit: function(payload){
        var self = this;
        return api.action('customer', 'orderCurbsideEvent', payload);
    }
});


var CrubsideCustomerView = Backbone.MozuView.extend({
    templateName: "back-office/customer-at-curbside-content",
    onDeliveryMethodSubmit: function(e) {
            var self = this,
            $target = $(e.currentTarget);            
            e.preventDefault();
            var isBackofficePreview = $('[data-mz-isBackofficePreview]').val();
            var payload = {
                orderNumber: self.model.get('orderNumber'),
                orderId: self.model.get('orderId'),
                shipmentNumber: self.model.get('shipmentNumber'),
                CurbsideFormData: [
                    {
                        key: $('#vehiclemodelLabel').text(),
                        value: $('[data-mz-vehiclemodel]').val()
                    },
                    {
                        key: $('#licenseplatelabel').text(),
                        value: $('[data-mz-licenseplate]').val()
                    },
                    {
                        key: $('#parkingspotlabel').text(),
                        value: $('[data-mz-parkingspotText]').val()
                    },
                    {
                        key: $('#deliverymethodlabel').text(),
                        value: $("#selectdeliverymethod").val()
                    }
                ]
            };
            if(isBackofficePreview === 'True'){
                window.location.href = window.location.pathname + '-qrcode';
              }
              else {
                $('#btnSubmitCurbsideInfo').prop('disabled', true);
                this.model.onDeliveryMethodSubmit(payload).then(function(respnse){
                    self.model.set('hasCurbsideData', respnse.data.hasCurbsideData);
                    self.model.set('qrCode',respnse.data.qrCode);
                    self.render();
                });
    }
    },
    render: function(){
        Backbone.MozuView.prototype.render.apply(this, arguments);
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

