/**
 * @class Taco.controller.Analytics
 * Creates and maintains a Google Analytics tracker and subscribes to events.
 * **This controller expects there to be a global variable called `googleAnalyticsAccountId`. If the variable isn't present, it will throw an error. The variable should probably be set in the view template that initially renders the app.
 */

Ext.define('Taco.controller.Analytics', {
    extend: 'Ext.app.Controller',
    alternateClassName: 'Taco.Analytics',
    /**
     * The Google Analytics tracker object.
     */
    gaq: undefined,

    /**
     * Create the Google Analytics PageTracker object.
     * @param {String=} ua Google Analytics account number to use. Defaults to `window.googleAnalyticsAccountId`.
     * @return {Object} The GA tracker, which is also assigned to the #gaq property.
     */
    createTracker: function (ua) {
        var me = this;
        var gaUA = ua || Taco.googleAnalyticsAccountId;
        if (!gaUA) {
            this.trackingEnabled = false;
            return false;
        }

        var _gaq = window._gaq = this.gaq = [];
        _gaq.push(['_setAccount', gaUA]);
        _gaq.push(['_setDomainName', 'mozu.com']);
        _gaq.push(['_setAllowLinker', true]);

        Ext.Loader.loadScript({
            url: ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
            onLoad: function () {
                me.gaq = window._gaq;
            }
        });

        this.trackingEnabled = true;

        return _gaq;
    },

    /**
     * Call Google Analytics. Use this like you would push function calls into the _gaq code snippet in a more traditional environment. The array wrapper can be eliminated and calls can be chained. For example:
     *
     *     //traditional model
     *     _gaq.push(['_trackPageview']);
     *     _gaq.push(['_trackEvent','Products','Edit','Callaway Driver'])
     *
     *     //using .callGA
     *     Taco.Analytics.callGA('_trackPageview')
     * 	                 .callGA('_trackEvent','Products','Edit','Callaway Driver');
     *
     *
     * @return {Taco.controller.Analytics}
     */
    callGA: function () {
        if (!this.trackingEnabled) return;
        var args = Ext.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
        this.gaq.push(args);
        return this;
    },

    onLaunch: function () {
        var me = this;
        this.createTracker();

        // monitor pageviews
        Taco.core.StateManager.on({
            beforenavigate: function () {
                var oldState = Taco.core.StateManager.getCurrentState();
                if (oldState && oldState.uri) me.callGA('_setReferrerOverride', '/admin/' + oldState.uri);
            },
            statechange: function () {
                me.callGA('_trackPageview');
            }
        });

        Taco.Analytics = this;
    }

});