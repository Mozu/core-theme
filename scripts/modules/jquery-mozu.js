/**
 * This file adds some common plugins to jQuery and then returns jQuery, so you can require it instead of jQuery itself and then you're guaranteed to have these plugins.    * They are:
 *   **$.cookie** -- Adds cookie management, using normal jQuery overload style: $.cookie('foo') gets foo cookie, $.cookie('foo','bar') sets it. *(This plugin is a separate file, shimmed in using the shim plugin.)*
 *   **$.fn.jsonData** -- Equivalent to the getter function of  $.fn.data, but without a weird jQuery bug that fails to parse JSON properly if it's been HTML escaped into an attribute.
 *   **$.fn.noFlickerFadeIn** -- A version of $.fn.fadeIn that operates on visibility:invisible objects, so there's no document reflow.
 *   **$.fn.ScrollTo** -- A plugin to smoothly scroll any element into view.
 */
define(["jquery", "vendor/jquery-scrollto", "vendor/jquery-cookie"], function ($) {

   
    $.fn.jsonData = function (dataAttr) {
        var d = this.attr("data-mz-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    // use this instead of fadeIn for elements that are set to visibility: hidden instead of display:none
    // display:none on large elements makes the page look tiny at first, the footer hugging the header
    $.fn.noFlickerFadeIn = function () {
        this.css('visibility', 'visible');
        if (Modernizr.csstransitions) {
            this.css('opacity', 1);
        } else {
            this.animate({ opacity: 1 }, 300);
        }
    };

    return $.noConflict();

});
