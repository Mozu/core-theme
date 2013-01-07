define(["jquery", "knockout", "modules/models-checkout", "ajax![method=post]/checkout/data", "shim!vendor/bootstrap/bootstrap-affix[jquery=jQuery]"], function ($, ko, CheckoutModels, currentCheckoutModel) {
    var checkoutViewModel = {};
    $(document).ready(function () {

        var $checkoutView = $('#mz-checkout-form');

        if (currentCheckoutModel && $checkoutView[0]) {

            checkoutViewModel = new CheckoutModels.CheckoutPage(CheckoutModels.mapFromServer(currentCheckoutModel));

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
