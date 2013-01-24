/**
 * @class Taco.core.ux.tab.Panel
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.formtabpanel',

    componentCls: Taco.baseCSSPrefix + 'form-tab-panel',
    tabBar: {
        plain: true,
        ui: 'taco',
        defaults: {
            ui: 'taco'
        },
        items: [{
            xtype: 'tab',
            text: 'Add',
            ui: 'taco',
            closable: false,
            handler: function (tab) {
                console.log(tab);
            }
        }]
    },
    defaults: {
        closable: true,
        overflowY: 'auto'
    },

    navigation: true,

    initComponent: function () {
        var me = this;

        if (this.navigation) {
            this.lbar = {
                xtype: 'component',
                width: 160,
                html: 'sidebar'
            };
        }

        this.callParent(arguments);
    }
});