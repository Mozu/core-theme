/**
 * @class Taco.view.settings.discounts.Index
 */
Ext.define('Taco.view.settings.discounts.Index', {
    extend: 'Taco.view.react.Index',
    requires: [
        'Taco.view.navigation.ContextSwitcherBar'
    ],
    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
    },
    navHeaderCls: "taco-navheader",
    contextSwitchHeader: function () {
        var me = this;
        var items = [];

        if (this.contextConfig) {
            items.push({title: 'Discount Settings'});
            items.push(Ext.create('Taco.view.navigation.ContextSwitcherBar', this.contextConfig));
        }

        if (items.length === 0) {
            return false;
        }

        this.header = {
            xtype: 'container',
            itemId: 'navHeaderBottom',
            cls: me.navHeaderCls,
            items: items
        }
    },
    initComponent: function () {
        var me = this;

        me.contextSwitchHeader();

        me.body = {
            html: []
        };
        me.callParent(arguments);
    }
});