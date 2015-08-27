/**
 * Abstract dispatcher for routed applications in storefront.
 * Register a callback that will be called with a parsed URL.
 * @method onUrlChange(handler:function(e, uri)) -> undefined
 *         Add a handler to be called when the URL changes.
 */

define(['backbone'], function(Backbone) {

    Backbone.history.start({ pushState: true });

    var proto = Backbone.Router.prototype;

    // using a backbone router ONLY for its event emitter capability
    var Dispatcher = new Backbone.Router();

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

    return Dispatcher;

});