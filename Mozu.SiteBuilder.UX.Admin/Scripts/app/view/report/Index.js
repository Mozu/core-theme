Ext.define('Taco.view.report.Index', {
    ///extend: 'Ext.panel.Panel',
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Ext.ux.IFrame',
        'Ext.panel.Panel'
    ],
    //mixins: {
    //    navHeader: 'Taco.core.ux.mixins.NavHeader'
    //},

    //title: 'Business Intelligence',

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

        me.layout = 'fit';

        me.dashboardPanel = Ext.create('Ext.panel.Panel', {
            itemId: 'dashboardPanel',
            flex: 1,
            layout: {
                type: 'fit'
            }
        });

        me.items = [
            me.dashboardPanel
        ];

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



                console.log('Tenant Id: ', Taco.app.context.id);
                if (Taco.app.context.getSiteId()) {
                    console.log('siteid: ' + Taco.app.context.getSiteId());
                }
                console.log(dashboardLocation);


                if (!dashboardLocation) return;
                var iFrameChild = Ext.create('Ext.ux.IFrame', {
                    itemId: 'dashboardIframe',
                    height: '100%',
                    width: '100%',
                    src: dashboardLocation
                });
                me.dashboardPanel.add(iFrameChild);
                me.dashboardPanel.doLayout();
            }
        });

    }
})
