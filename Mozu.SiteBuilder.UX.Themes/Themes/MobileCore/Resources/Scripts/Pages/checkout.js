define(["jquery", "knockout", "modules/models-checkout", "ajax![method=post]/checkout/data"], function ($, ko, CheckoutModels, currentCheckoutModel) {
    var checkoutViewModel = {};
    $(document).ready(function () {

        var $checkoutView = $('#mz-checkout-form');

        if (currentCheckoutModel && $checkoutView[0]) {

            checkoutViewModel = new CheckoutModels.CheckoutPage(CheckoutModels.mapFromServer(currentCheckoutModel));

            ko.applyBindings(checkoutViewModel, $checkoutView[0]);

            // once applybindings is done, hide the loader and show the checkout view
            $('#mz-checkout-loading').remove();
            $checkoutView.css('display', 'none').css('visibility', 'visible').fadeIn(200);

            window.checkoutVM = checkoutViewModel;

            var $reviewPanel = $('#mz-checkout-reviewpanel');
            checkoutViewModel.orderStatus.subscribe(function (isReady) {
                if (isReady) {
                    setTimeout(function () { window.scrollTo(0, $reviewPanel.offset().top); }, 750);
                }
            });

        }
    });
    return checkoutViewModel;
});
