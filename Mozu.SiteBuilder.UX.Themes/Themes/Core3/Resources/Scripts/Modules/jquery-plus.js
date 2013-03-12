define(["jquery"], function ($) {


    // due to a bug in jQuery.data that won't fully parse JSON embedded in attributes, we have to use a polyfill plugin.
    $.fn.mozuData = function (dataAttr) {
        var d = this.attr("data-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    return $;

});
