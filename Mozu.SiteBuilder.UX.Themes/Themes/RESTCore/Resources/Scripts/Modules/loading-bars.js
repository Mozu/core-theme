define(['jquery'], function ($) {

    return $(document).ready(function () {
        // no one can stop me from writing an IE polyfill for keyframes that uses marquee
        if ($.browser.msie && $.browser.version <= 9) {
            $('.mz-loading-bar').wrapInner("<marquee direction=\"right\">")
        }
    });

});