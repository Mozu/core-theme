define(["shim!vendor/bootstrap/bootstrap-affix[modules/jquery-plus=jQuery]>jQuery", "modules/knockout-plus", "modules/models-checkout"], function ($, ko, CheckoutModels) {
    $(document).ready(function () {

        var $checkoutView = $('#mz-checkout-form'),
            checkoutData = $checkoutView.mozuData('checkout'),
            shippingMethodData = $checkoutView.mozuData('shippingmethods');

        checkoutData.availableShippingMethods = $.isArray(shippingMethodData) ? shippingMethodData : [];

        checkoutData.paymentApiBase = $checkoutView.mozuData('paymentapibase');

        var checkoutViewModel = new CheckoutModels.CheckoutPage(checkoutData);

        // add some view-only helpers
        checkoutViewModel.ShippingInfo.ShippingContact.nextButtonText = ko.computed(function () {
            return checkoutViewModel.ShippingInfo.stepStatus() == 'new' ? 'Next' : 'Update'
        });

        checkoutViewModel.ShippingInfo.nextButtonText = ko.computed(function () {
            return checkoutViewModel.BillingInfo.stepStatus() == 'new' ? 'Next' : 'Update'
        });

        ko.applyBindings(checkoutViewModel, $checkoutView[0]);

        // once applybindings is done, hide the loader and show the checkout view
        $('#mz-checkout-loading').remove();
        $checkoutView.noFlickerFadeIn();

        window.checkoutVM = checkoutViewModel;

        checkoutViewModel.messages.subscribe(function (newValue) {
            if (newValue) {
                window.scrollTo(0, 0);
            }
        });

        checkoutViewModel.on('complete', function () {
            window.location = "/checkout/" + checkoutViewModel.apiModel.data.Id + "/confirmation";
        });


        var $reviewPanel = $('#mz-checkout-reviewpanel');
        checkoutViewModel.orderStatus.subscribe(function (isReady) {
            if (isReady) {
                setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
            }
        });
    });
});
