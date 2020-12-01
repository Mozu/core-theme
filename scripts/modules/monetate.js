define(['modules/api',
'modules/jquery-mozu',
'hyprlivecontext'], function (api, $, hlc) {
    function callMonetateMethod(methodName, source, valGetter) {
        if (source.length > 0) {
            var vals = [];
            source.each(function () {
                var val = valGetter ? valGetter(this) : this;
                vals.push(val);
            });
            window.monetateQ.push([
                methodName,
                vals
            ]);
        }
    }
    function compareSummaries(cached, fresh) {
        if (cached.itemCount !== fresh.itemCount || cached.total !== fresh.total || cached.totalQuantity !== fresh.totalQuantity) return false;
        return true;
    }
    function getCartSource(cart) {
        var source = [];
        cart.items.forEach(function (item) {
            source.push({
                'productId': item.product.productVariantCode || item.product.productCode,
                'quantity': item.quantity,
                'unitPrice': item.unitPrice.listAmount,
                'currency': cart.currencyCode
            });
        });
        return source;
    }
    // ensure window.monetateQ
    window.monetateQ = window.monetateQ || [];
    var store = window.localStorage;
    var CART_SUMMARY_KEY = '__cartsummary__';
    $(document).ready(function () {
        // setPageType
        var pt = hlc.locals.pageContext.pageType;
        window.monetateQ.push([
            "setPageType",
            pt === 'category' ? 'index' : pt
        ]);
        // addProducts
        callMonetateMethod('addProducts', $('.mz-productlisting'), function (p) { return $(p).data().mzProduct; } );
        // addBreadcrumbs
        callMonetateMethod('addBreadcrumbs', $('.mz-breadcrumb-link', '.mz-breadcrumb-current').not('.hidden'), function (b) { return $(b).text(); } );
        // addProductDetails
        if (hlc.locals.pageContext.pageType === 'product') {
            callMonetateMethod('addProductDetails', $([hlc.locals.pageContext.productCode]));
        }

        Promise.all([
            new Promise(function (resolve, reject) {
                api.get('cartsummary').then(function (resp) {
                    var cs = resp.data;
                    if (!cs.hasActiveCart) return resolve();

                    var cached = store.getItem(CART_SUMMARY_KEY);
                    if (!cached || !compareSummaries(cached, cs)) {
                        api.get('cart').then(function (cart) {
                            var source = getCartSource(cart.data);
                            cs.data = source;
                            store.setItem(CART_SUMMARY_KEY, cs);
                        });
                    }
                    callMonetateMethod('addCartRows', cs.data);
                    resolve();
                });
            })
        ]).then(window.monetateQ.push(['trackData']));
    });
});