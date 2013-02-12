/**
 * @class Taco.core.ux.content.ContainerWithSidebar
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.content.ContainerWithSidebar', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.contentcontainerwithsidebar',
    requires: ['Taco.core.ux.content.Sidebar'],

    layout: {
        align: 'stretch',
        type: 'border'
    },

    cls: 'taco-content-container-with-sidebar',

    arrangePanels: function() {
        var me = this;

        me.callParent(arguments);

        me.main = Ext.create('Ext.Container', {
            region: 'center',
            cls: 'taco-content-container',
            flex: 1,
            layout: {
                align: 'stretch',
                type: 'vbox'
            },
            items: [me.header, me.body]
        });

        me.sidebar = me.sidebar || {};

        // create the sidebar unless some subclass has created it!
        if (!me.sidebar.$className) me.sidebar = Ext.widget('sidebar', me.sidebar);

        me.items = [me.main, me.sidebar];
    }

});