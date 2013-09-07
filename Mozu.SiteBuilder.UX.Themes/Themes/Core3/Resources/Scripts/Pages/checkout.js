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

        // run jquery affix manually (since the spy attributes don't work with IE in knockout)
        var $rightcol = $('#mz-checkout-rightcol');
        var rcOffset = $rightcol.offset();
        var affixer = $rightcol.css('left', rcOffset.left).affix({ offset: rcOffset }).data('affix');


        $(window).on('resize', function () {
            if ($rightcol.hasClass('affix')) {
                $rightcol.css('position', 'static').css('left', $rightcol.offset().left).css('position', '');
            } else {
                $rightcol.css('left', $rightcol.offset().left);
            }
        });

        window.checkoutVM = checkoutViewModel;

        checkoutViewModel.messages.subscribe(function (newValue) {
            if (newValue && newValue.length) {
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


        //handle enter key in different focus areas
        $checkoutView
            .on('keypress', '#mz-shipping-address-panel input', function (e) {
                if (e.which === 13) {
                    checkoutViewModel.ShippingInfo.ShippingContact.nextStep();
                    return false;
                }
            })
            .on('keypress', '#mz-shipping-method-panel input', function (e) {
                if (e.which === 13) {
                    checkoutViewModel.ShippingInfo.nextStep();
                    return false;
                }
            })
            .on('keypress', '#mz-payment-information-panel input', function (e) {
                if (e.which === 13) {
                    checkoutViewModel.BillingInfo.nextStep();
                    return false;
                }
            })
            .on('keypress', '#mz-coupon-code, #mz-coupon-submit', function (e) {
                if (e.which === 13) {
                    checkoutViewModel.addCoupon();
                    return false;
                }
            });

    });
});
