/**
 * @class Taco.core.ux.browser.BrowserPage
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.browser.BrowserPage', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.browserpage',
    requires: ['Taco.core.ux.content.Sidebar'],

    layout: {
        align: 'stretch',
        type: 'hbox'
    },

    arrangePanels: function() {
        var me = this;

        me.callParent(arguments);

        me.main = Ext.create('Ext.Container', {
            flex: 1,
            layout: {
                align: 'stretch',
                type: 'vbox'
            },
            items: [me.header, me.body]
        });

        var sidebarDefaults = {
            width: 300
        };

        if (me.sidebar) {
            if (!me.sidebar.$className) { // if the sidebar is already created by some subclass, do nothing
                me.sidebar = Ext.widget('sidebar', Ext.apply(sidebarDefaults, me.sidebar));
            }
        } else {
            me.sidebar = Ext.widget('sidebar', sidebarDefaults);
        }

        me.items = [me.main, me.sidebar];
    }

});