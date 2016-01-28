/**
 * Header portion logo
 * @class Taco.core.ux.content.Logo
 */

Ext.define('Taco.core.ux.content.Logo', {
    extend: 'Ext.Component',
    alias: 'widget.contentlogo',
    
    cls: Taco.baseCSSPrefix + 'mozulogo',
    width: 68,
    autoEl: {
        tag: 'a',
        href: '/admin',
        title: ' version:[' + Taco.apiVersion + '] date:[' + Ext.Date.format(new Date(Taco.buildDate), 'Y-m-d H:i:s') + ']'
    },
    listeners: {
        click: {
            element: 'el', //bind to the underlying el property on the panel
            fn: function (e) {
                e.preventDefault();
                // Taco.app.context.setCurrentContext(Taco.app.context);
                Taco.core.StateManager.attemptNavigate(Taco.app.context.urlToken);

            }
        }
    }
});