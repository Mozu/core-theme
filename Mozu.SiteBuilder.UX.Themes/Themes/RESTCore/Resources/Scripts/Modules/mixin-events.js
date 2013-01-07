// Mixes in jQuery event methods to a given object, all operating on a shadow jQuerifyed version of that object.
define(['jquery'], function ($) {
    var interface = {
        __makeBus: function() {
            this.__$ = $(this);
        }
    };
    $.each(['trigger','one','on','off'], function(method) {
        interface[method] = function(evt, arg2) {
            !this.__$ && this.__makeBus();
            return this.__$[method](evt, arg2);
        };
    });
    return interface;
});