define(["jquery"], function($){



    // replace 'pluginName' with the name of your plugin
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
            sliders = t.find(".mz-site-nav-slideout.l2"),
            secondLevelSliders = t.find(".mz-site-nav-slideout.l3"),
            firstLevelLIs = t.children(".mz-site-nav-item"),
            secondLevelLIs = firstLevelLIs.find(".mz-site-nav-item");
            
            sliders.each(function () {
                var t = $(this),
                    ulL2 = t.find(".mz-site-nav-sub"),
                    navHeight = ulL2.outerHeight(true);
                t.height(navHeight)
                    .data("navHeight", navHeight)
                    //.css({"min-width": t.parents(".mz-site-nav-li").outerWidth(true) + "px"});
            })

            firstLevelLIs.hover(function () {
                    var t = $(this),
                    slideout = t.find(".mz-site-nav-slideout.l2");
                    if(Modernizr.cssanimations){
                        slideout.removeClass("zeroHeight");
                    }else {
                        slideout
                            .css({height : 0})
                            .removeClass("zeroHeight")
                            .stop()
                            .animate({height : t.find(".mz-site-nav-slideout.l2").data("navHeight") + "px"}, 600);
                    }

                }, function () {
                    var t = $(this), 
                    slideout = t.find(".mz-site-nav-slideout.l2");
                    if(Modernizr.cssanimations){
                        t.find(".mz-site-nav-slideout-L2").addClass("zeroHeight");
                    } else {
                        slideout
                            .stop()
                            .animate({height : 0}, o.dropDownSpeed,
                                function(){slideout.addClass("zeroHeight")});
                    }
            });

            secondLevelLIs.hover(function () {
                var t = $(this);
                t.parents(".mz-site-nav-slideout.l2")
                        .css({
                            "overflow": "visible"
                        });

                }, function () {
                    var t = $(this);
                    t.parents(".mz-site-nav-slideout.l2")
                        .css({
                            "overflow": "hidden"
                        });
            })
        });

    };

    // public functions definition
    //$.fn.sitemenu.functionName = function (foo) {
    //    return this;
    //};

    // private functions definition
    //function foobar() { }

 
})
