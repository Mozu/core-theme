define(["shim!vendor/jquery-cookie[jquery=jQuery]>jQuery"], function ($) {


    // due to a bug in jQuery.data that won't fully parse JSON embedded in attributes, we have to use a polyfill plugin.
    $.fn.mozuData = function (dataAttr) {
        var d = this.attr("data-mz-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    // use this instead of fadeIn for elements that are set to visibility: hidden instead of display:none
    // display:none on large elements makes the page look tiny at first, the footer hugging the header
    $.fn.noFlickerFadeIn = function () {
        this.css('opacity', '0').css('visibility', 'visible').animate({ opacity: 1 });
    };

    return $;

});
