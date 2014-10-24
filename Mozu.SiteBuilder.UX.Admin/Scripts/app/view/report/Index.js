Ext.define('Taco.view.report.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Ext.ux.IFrame',
        'Ext.panel.Panel'
    ],

    cls: undefined,

    constructor: function (conf) {
        this.callParent(arguments);
    },

    contextConfig: {
        supportedLevels: ['t', 's'], //, 's'
        requiresContextOfType: ['t', 's']
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Reports'
        };
        me.dashboardPanel = Ext.create('Ext.panel.Panel', {
            itemId: 'dashboardPanel',
            flex: 1,
            layout: {
                type: 'fit'
            }
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [me.dashboardPanel]
        });

        me.callParent(arguments);
        me.loadDashboard();
    },

    loadDashboard: function () {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/report/dashboard',
            method: 'GET',
            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (!obj || !obj.items) return;
                var dashboardLocation = obj.items;

                if (Taco.app.context.getSiteId()) {
                    dashboardLocation = dashboardLocation + '&SiteId=' + Taco.app.context.getSiteId();
                } else {
                    dashboardLocation += '&SiteId=all';
                }
                //2168, 2169
                if (!dashboardLocation) return;
                var iFrameChild = Ext.create('Ext.ux.IFrame', {
                    itemId: 'dashboardIframe',
                    height: '100%',
                    width: '100%',
                    src: dashboardLocation
                });
                me.dashboardPanel.add(iFrameChild);
                me.dashboardPanel.doLayout();

                //console.log(dashboardLocation);
            }
        });

    }
})
