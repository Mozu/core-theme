define(["jquery", "knockout", "modules/models-checkout", "vendor/bootstrap/bootstrap-affix"], function ($, ko, CheckoutModels) {
    $.ajax("/checkout/data", { type: "POST", dataType: 'json' }).done(function (currentCheckoutModel) {
        var checkoutViewModel = {};
        $(document).ready(function () {

            var $checkoutView = $('#checkout-form');

            if (currentCheckoutModel && $checkoutView[0]) {

                checkoutViewModel = new CheckoutModels.CheckoutPage(CheckoutModels.mapFromServer(currentCheckoutModel));

                ko.applyBindings(checkoutViewModel, $checkoutView[0]);

                // once applybindings is done, hide the loader and show the checkout view
                $('#checkout-loading').remove();
                $checkoutView.css('display', 'none').css('visibility', 'visible').fadeIn(200);

                // run jquery affix manually (since the spy attributes don't work with IE in knockout)
                var $rightcol = $('#checkout-rightcol');
                var affixer = $rightcol.affix({ offset: $rightcol.offset() }).data('affix');

                window.checkoutVM = checkoutViewModel;

                checkoutViewModel.messages.subscribe(function (newValue) {
                    if (newValue) {
                        window.scrollTo(0, 0);
                    }
                    setTimeout(function () { affixer.options.offset = $rightcol.offset() }, 250);
                });


                var $reviewPanel = $('#reviewpanel');
                checkoutViewModel.orderStatus.subscribe(function (isReady) {
                    if (isReady) {
                        setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
                    }
                });

            }
        });
        return checkoutViewModel;
    });
});
