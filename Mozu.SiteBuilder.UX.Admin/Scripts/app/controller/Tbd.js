/**
 * @class Taco.controller.Tbd
 * The catchall controller.
 */
Ext.define('Taco.controller.Tbd', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.core.ux.content.Container',
        'Taco.view.tbd.Index',
        'Taco.view.location.Index'
    ],

    indexView: 'Taco.view.tbd.Index',
    views: ['tbd.Index'],

    statics: {
        getTbdView: function () {
            this.createContentView('Ext.Component', {
                cls: Taco.baseCSSPrefix + 'view-error',
                html: '<h1>TBD</h1><h2>Coming Soon</h2><p>This feature is still in development. Look for this feature to be enabled in the near future!</p>'
            });
        }
    },
    
    accounts:   function () { this.statics().getTbdView.call(this); },
    //channels:   function () { this.statics().getTbdView.call(this); },
    contacts:   function () { this.statics().getTbdView.call(this); },
    inventory:  function () { this.statics().getTbdView.call(this); },
    orders:     function () { this.statics().getTbdView.call(this); },
    promotions: function () { this.statics().getTbdView.call(this); },
    //reports:    function () { this.statics().getTbdView.call(this); },
    targeting:  function () { this.statics().getTbdView.call(this); }
});
