define(['modules/api',
'modules/jquery-mozu',
'hyprlivecontext'], function (api, $, hlc) {
    function callMonetateMethod(methodName, source, valGetter) {
        if (source.length > 0) {
            window.monetateQ.push([
                methodName,
                valGetter ? source.map(valGetter) : source
            ]);
        }
    }
    function compareSummaries(cached, fresh) {
        if (cached.itemCount !== fresh.itemCount || cached.total !== fresh.total || cached.totalQuantity !== fresh.totalQuantity) return false;
        return true;
    }
    function getCartSource(cart) {
        var source = [];
        cart.items.forEach(function (item, idx) {
            source.push({
                'productId': item.product.productCode,
                'quantity': item.quantity,
                'unitPrice': item.unitPrice.listAmount,
                'currency': cart.currencyCode
            });
            if (item.product.variationProductCode) source[idx].sku = item.product.variationProductCode;
            if (cart.orderNumber) source[idx].purchaseId = cart.orderNumber;
        });
        return source;
    }
    function getPageType(input) {
        switch (input) {
            case "landing":
            case "home":
            case "category":
            case "parent-category":
                return 'index';
            default:
                return input;
        }
    }
    // ensure window.monetateQ
    window.monetateQ = window.monetateQ || [];
    var store = window.localStorage;
    var CART_SUMMARY_KEY = '__cartsummary__';
    var productTimeout;

    function timeout () {
        var prodMod = window.productView.model;
        prodMod.on('optionsUpdated', function() {
            // can I use this instead of prodMod??
            if (prodMod.apiModel.data.variationProductCode) {
                trackData(prodMod.apiModel.data.variationProductCode);
            }
        });
    }

    function trackData(sku) {
        // setPageType
        var pt = hlc.locals.pageContext.pageType;
        window.monetateQ.push([
            "setPageType",
            getPageType(pt)
        ]);
        // addProducts
        callMonetateMethod('addProducts', $('.mz-productlisting').toArray(), function (p) { return $(p).data().mzProduct; } );
        // addBreadcrumbs
        callMonetateMethod('addBreadcrumbs', $('.mz-breadcrumb-link, .mz-breadcrumb-current').not('.hidden').toArray(), function (b) { return $(b).text(); } );
        // page specific actions
        switch(pt) {
            case 'product':
                // addProductDetails
                var details = [hlc.locals.pageContext.productCode];
                if (typeof sku === 'string') {
                    details = [{
                        'productId': hlc.locals.pageContext.productCode,
                        'sku': sku
                    }];
                }
                callMonetateMethod('addProductDetails', details);
                
                // if the optionsUpdated callback hasn't been hooked up, do that
                // using a timeout because the productView is set during document ready, 
                // which is where we are the first time this is called, so it's not set yet on this thread
                if (!productTimeout)
                    productTimeout = setTimeout(timeout, 1);
                break;
            case 'confirmation':
            case 'confirmationv2':
                // addPurchaseRows
                var order = JSON.parse(document.getElementById('data-mz-preload-order').innerText);
                var source = getCartSource(order);
                callMonetateMethod('addPurchaseRows', source);
                break;
        }

        api.get('cartsummary').then(function (resp) {
            var cs = resp.data;
            if (!cs.hasActiveCart) return store.removeItem(CART_SUMMARY_KEY);

            // addCartRows
            var cached = store.getItem(CART_SUMMARY_KEY);
            if (cached && (cached = JSON.parse(cached)) && compareSummaries(cached, cs)) {
                return callMonetateMethod('addCartRows', cached.data);
            } else {
                return api.get('cart').then(function (cart) {
                    var source = getCartSource(cart.data);
                    cs.data = source;
                    store.setItem(CART_SUMMARY_KEY, JSON.stringify(cs));
                    callMonetateMethod('addCartRows', source);
                });
            }
        }).then(function () {
            window.monetateQ.push(['trackData']);
            // check for existence of element with id monetateLoaded
            // we add this div to indicate to the monetate tag that we are
            // ready to send data; this avoids the 'Unknown' first track
            if ($('#monetateLoaded').length === 0)
                $('body').append($('<div/>', {
                    id: 'monetateLoaded',
                    style: 'display: none;'
                }));
        });
    }

    $(document).ready(function () { trackData(); });
});