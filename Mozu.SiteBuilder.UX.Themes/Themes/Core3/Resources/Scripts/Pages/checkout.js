define(["shim!vendor/bootstrap/bootstrap-affix[modules/jquery-plus=jQuery]>jQuery", "knockout", "modules/models-checkout"], function ($, ko, CheckoutModels) {
    $(document).ready(function () {

        var $checkoutView = $('#mz-checkout-form'),
            checkoutData = $checkoutView.mozuData('mz-checkout'),
            shippingMethodData = $checkoutView.mozuData('mz-shippingmethods');

        checkoutData.availableShippingMethods = $.isArray(shippingMethodData) ? shippingMethodData : [];

        checkoutData.paymentApiBase = $checkoutView.mozuData('mz-paymentapibase');

        var checkoutViewModel = new CheckoutModels.CheckoutPage(checkoutData);

        // add some view-only helpers
        checkoutViewModel.Shipment.ShippingAddress.nextButtonText = ko.computed(function () {
            return checkoutViewModel.Shipment.stepStatus() == 'new' ? 'Next' : 'Update'
        });

        checkoutViewModel.Shipment.nextButtonText = ko.computed(function () {
            return checkoutViewModel.Payment.stepStatus() == 'new' ? 'Next' : 'Update'
        });

        ko.applyBindings(checkoutViewModel, $checkoutView[0]);

        // once applybindings is done, hide the loader and show the checkout view
        $('#mz-checkout-loading').remove();
        $checkoutView.css('display', 'none').css('visibility', 'visible').fadeIn(200);

        // run jquery affix manually (since the spy attributes don't work with IE in knockout)
        var $rightcol = $('#mz-checkout-rightcol');
        var affixer = $rightcol.affix({ offset: $rightcol.offset() }).data('affix');

        window.checkoutVM = checkoutViewModel;

        checkoutViewModel.messages.subscribe(function (newValue) {
            if (newValue) {
                window.scrollTo(0, 0);
            }
            setTimeout(function () { affixer.options.offset = $rightcol.offset() }, 250);
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
