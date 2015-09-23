/**
 * Abstract dispatcher for routed applications in storefront.
 * Register a callback that will be called with a parsed URL.
 * @method onUrlChange(handler:function(e, uri)) -> undefined
 *         Add a handler to be called when the URL changes.
 */

define(['backbone'], function(Backbone) {

    var Dispatcher;
    var proto;

    if (Modernizr.history) {
        Backbone.history.start({ pushState: true });

        proto = Backbone.Router.prototype;

        // using a backbone router ONLY for its event emitter capability
        Dispatcher = new Backbone.Router();

        // register catchall route so it fires event
        Dispatcher.route('*all', 'all', function() { });

        // hiding the implementation of the particular event emitter
        Dispatcher.onChange = function(cb) {
            Dispatcher.on('route:all', function() {
                cb(window.location.pathname + window.location.search + window.location.hash);
            });
        };

        Dispatcher.send = function(url) {
            return proto.navigate.call(this, url, { trigger: true });
        };

        Dispatcher.replace = function(url) {
            return proto.navigate.call(this, url, { replace: true });
        };

    } else {
        // if the browser does not support the HTML5 History API,
        // the dispatcher should simply default to full page navigation.
        Dispatcher = {
            send: function(url) {
                window.location = url;
            },
            replace: function(url) {
                window.location.replace(url);
            },
            onChange: function() { } // let the browser do its thing instead
        };
    }

    

    return Dispatcher;

});