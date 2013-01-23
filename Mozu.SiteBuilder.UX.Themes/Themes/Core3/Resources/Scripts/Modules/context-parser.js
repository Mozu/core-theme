define(['shim!vendor/jquery-cookie[jquery=jQuery]>jQuery'], function ($) {
    var sbContext = $.cookie('SBCONTEXT').split('&');
    var ret = {}, pair;
    for (var i = sbContext.length - 1; i >= 0; --i) {
        pair = sbContext[i].split('=');
        ret[pair[0]] = pair[1];
    }
    return ret;
});