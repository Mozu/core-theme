/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var items;

        items = [{
            xtype: 'tabpanel',
            tabBar: {
                tools: [{
                    xtype: 'button',
                    ui: 'action-primary',
                    scale: 'medium',
                    text: 'click'
                }]
            },
            items: [{
                title: 'Editor',
                html: 'editor'
            }, {
                title: 'Settings',
                html: 'settings'
            }]
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    }
});
