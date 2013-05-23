define(["jquery", 'shim!vendor/swipe.min>Swipe'], function ($, Swipe) {

    var swipe, $swipeBullets, $imageContainer;

    var methods = {
        init: function () {
            $imageContainer = $('[data-mz-role="productimages-main"]');
            $swipeBullets = $('[data-mz-role="productimages-bullets"]').children();

            if (Modernizr.csstransforms && $imageContainer[0]) {
                swipe = new Swipe($imageContainer[0], {
                    callback: function (e, pos) {
                        $swipeBullets.removeClass('mz-active').eq(pos).addClass('mz-active');
                    }
                });

                $swipeBullets.on('click', function () {
                    swipe.slide($(this).index(), 400);
                })

                .first().addClass('mz-active');
            }
        }
    };

    $(document).ready(methods.init);

    return methods;
});