define([
    'modules/jquery-mozu',
    'underscore',
    'hyprlive',
    'modules/backbone-mozu',
    'modules/api'
],
    function ($, _, Hypr, Backbone, api) {

var CurbsideCustomerSurveyModel = Backbone.MozuModel.extend({
    mozuType: 'curbsideCustomerSurvey',
    onCurbsideSurveySubmit: function(payload){
        var self = this;
        //TODO: Once API Changes done then we can uncomment this code to give call to API
        //return api.action('customer', 'orderCurbsideSurveyEvent', payload);
    }
});


var CurbsideCustomerSurveyView = Backbone.MozuView.extend({
    templateName: "back-office/curbside-customer-survey-content",
    onCurbsideSurveySubmit: function(e) {
        var self = this,
            $target = $(e.currentTarget);

            e.preventDefault();
            var payload ={
                orderNumber: self.model.get('orderNumber'),
                orderId: self.model.get('orderId'),
                shipmentNumber: self.model.get('shipmentNumber'),
                CurbsideSurveyFormData: [
            
                    {
                        key: $('#surveyQuestion1').text(),
                        value: $("#selectedSurveyQuestion1").val()
                    },
                    {
                        key: $('#surveyQuestion2').text(),
                        value: $("#selectedSurveyQuestion2").val()
                    },
                    {
                        key: $('#surveyQuestion3').text(),
                        value: $("#selectedSurveyQuestion3").val()
                    },
                    {
                        key: $('#surveyQuestion4').text(),
                        value: $("#selectedSurveyQuestion4").val()
                    },
                    {
                        key: $('#SurveyAdditionalFeedback').text(),
                        value: $("#data-SurveyAdditionalFeedback").val()
                    }

                ]
            };
            
            //TODO: Once API Changes done then we can uncomment this code to give call to API
           // this.model.onCurbsideSurveySubmit(payload).then(function(respnse) {
            //self.model.set('hasCurbsideData', respnse.data.hasCurbsideData);   
            self.model.set('hasCurbsideSurveyData', true);
            self.render();
           // });
        },

    render: function(){
        Backbone.MozuView.prototype.render.apply(this, arguments);
    }

});


$(document).ready(function () {
    var curbsideSurveyModel = new CurbsideCustomerSurveyModel(require.mozuData("curbsideCustomerSurvey") || {});
    var curbsideSurveyView = new CurbsideCustomerSurveyView({
        el: $('#mz-curbside-customer-survey-content'),
        model: curbsideSurveyModel
    });

    curbsideSurveyView.render();
});

});

