define(["jquery"], function($){

    $.fn.sitemenu = function (options) {
        // plugin default options
        var defaults = {
            dropDownSpeed : 600,
            cssWrapperClass : null
        };

        // extends defaults with options provided
        if (options) {
            var options = $.extend(defaults, options);
        }

        // iterate over matched elements
        return this.each(function () {
            var o = options,
                t = $(this), 
            sliders = t.find('[data-mz-role="sitemenu-slideout-l2"]'),
            secondLevelSliders = t.find('[data-mz-role="sitemenu-slideout-l3"]'),
            firstLevelLIs = t.children('[data-mz-role="sitemenu-item"]'),
            secondLevelLIs = firstLevelLIs.find('[data-mz-role="sitemenu-item"]');
            
            sliders.each(function () {
                var t = $(this),
                    ulL2 = t.find('[data-mz-role="sitemenu-subnav"]'),
                    navHeight = ulL2.outerHeight(true);
                t.height(navHeight)
                    .data("navHeight", navHeight)
                    //.css({"min-width": t.parents(".mz-site-nav-li").outerWidth(true) + "px"});
            })

            firstLevelLIs.on('mouseover', function () {
                    var t = $(this),
                    slideout = t.find('[data-mz-role="sitemenu-slideout-l2"]');
                    if(Modernizr.cssanimations){
                        slideout.removeClass("mz-zero-height");
                    }else {
                        slideout
                            .css({height : 0})
                            .removeClass("mz-zero-height")
                            .stop()
                            .animate({ height: slideout.data("navHeight") + "px" }, 600);
                    }

                }).on('mouseout', function () {
                    var t = $(this), 
                    slideout = t.find('[data-mz-role="sitemenu-slideout-l2"]');
                    if(Modernizr.cssanimations){
                        slideout.addClass("mz-zero-height");
                    } else {
                        slideout
                            .stop()
                            .animate({height : 0}, o.dropDownSpeed,
                                function () { slideout.addClass("mz-zero-height") });
                    }
            });

            secondLevelLIs.on('mouseover',function () {
                var t = $(this);
                t.parents('[data-mz-role="sitemenu-slideout-l2"]')
                        .css({
                            "overflow": "visible"
                        });

            }).on('mouseout', function () {
                    var t = $(this);
                    t.parents('[data-mz-role="sitemenu-slideout-l2"]')
                        .css({
                            "overflow": "hidden"
                        });
            })
        });

    };

    return $(document).ready(function () {
        $('[data-mz-role="sitemenu"]').sitemenu();
    });
 
})
