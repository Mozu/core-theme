/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
define(['modules/jquery-mozu', 'modules/api', 'hyprlivecontext'], function ($, api, HyprLiveContext) {

    var $cartCount,
        user = require.mozuData('user'),
        userId = user.userId,
        $document = $(document),
        CartMonitor = {
            setCount: function(count) {
                this.$el.text(count);
                savedCounts[userId] = count;
                $.cookie('mozucartcount', JSON.stringify(savedCounts), { path: '/' });
            },
            addToCount: function(count) {
                this.setCount(this.getCount() + count);
            },
            getCount: function() {
                return parseInt(this.$el.text(), 10) || 0;
            },
            update: function() {
                api.get('cartsummary').then(function(summary) {
                    $document.ready(function() {
                        CartMonitor.setCount(summary.count());
                    });
                });
            }
        },
        savedCounts,
        savedCount;

    try {
        savedCounts = JSON.parse($.cookie('mozucartcount'));
    } catch(e) {}

    if (!savedCounts) savedCounts = {};
    savedCount = savedCounts && savedCounts[userId];

    if (isNaN(savedCount)) {
        CartMonitor.update();
    }

    $document.ready(function () {
        CartMonitor.$el = $('[data-mz-role="cartmonitor"]').text(savedCount || 0);

        if (HyprLiveContext.locals.themeSettings.edgeCachingEnabled) {
            try {
                var user = JSON.parse(atob($.cookie('_mzPc'))).user;

                if (user.isSalesRep) {
                    $('#mz-sign-in-salesrep').show();
                } else {
                    $('#mz-sign-in-salesrep').hide();
                }

                if (user.isAnonymous|| !user.isAuthenticated ) {
                    $('.mz-sign-in-logged-in-user').hide();
                    $('.mz-sign-in-guest-user').show();
                } else {
                    $('.mz-sign-in-logged-in-user').show();
                    $('.mz-sign-in-guest-user').hide();
                }
            } catch(err) {
                console.error(err);
            }
        }

    });

    return CartMonitor;

});