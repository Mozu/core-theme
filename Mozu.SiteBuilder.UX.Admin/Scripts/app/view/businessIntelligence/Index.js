Ext.define('Taco.view.businessIntelligence.Index', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.ux.IFrame'
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
        supportedLevels: ['t'], //, 's'
        requiresContextOfType: ['t', 's']
    },

    initComponent: function () {
        var me = this;

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
