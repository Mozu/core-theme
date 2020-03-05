/**
 * @class Taco.view.report.Split
 */


Ext.define('Taco.view.report.ReportView', {
    extend: 'Ext.panel.Panel',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    alias: [
       'widget.reports-view',
       'widget.reports.view'
    ],
    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    title: 'Reports',
    bodyPadding: '20 10 0 10',
    cls: 'taco-reporting-view',
    hideContextSwitcherBar: true,
    contextConfig: {
        supportedLevels: ['t', 's'],
        requiresContextOfType: ['t', 's']
    },
    initComponent: function () {

        
        this.items = [];
        this.items.unshift(this.reportCard());

        var ctxSwitcher = Ext.create('Taco.view.navigation.ContextSwitcherSelector', {
            callToActionText: ''
        });

        ctxSwitcher.store.insert(0, {
            text: 'All Sites',
            value: 0,
            type: 'tenant'
        });


        this.actions = [];
        

        this.mixins.navHeader.init.apply(this);

        this.callParent(arguments);

        this.loadDashboard();

    },

    reportCard: function () {
        return Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'card',
                align: 'stretch'
            },
            itemId: 'reportHolder',
            title: false,
            width: '100%',
            split: true,
            items: [
                {
                    xtype: 'panel',
                    layout: {
                        type: 'fit',
                        align: 'stretch'
                    },
                    itemId: 'reportPanel',
                    border: false
                }
            ]
        });
    },
    getFieldValue: function (itemId) {
        if (!itemId || !this.down(itemId)) {
            return false;
        }

        return this.down(itemId).getValue();
    },
 
    loadDashboard: function () {
        var reportIframe = this.down("#reportPanel").down("#dashboardIframe");
        if (reportIframe)
            reportIframe.destroy();

        var me = this;
        me.reportPanel = me.down("#reportPanel");
       
        Ext.Ajax.request({
            url: '/admin/app/report/lookerdashboard',
            method: 'POST',
            params: {
                fromDate: me.getFieldValue('#fromDateField'),
                toDate: me.getFieldValue('#toDateField'),
                chartioId: me.chartioId,
                siteId: me.getFieldValue('#siteField')
            },
            success: function (response) {
                var obj = Ext.JSON.decode(response.responseText);
                if (!obj || !obj.items) return;
                var dashboardLocation = obj.items;

                if (!dashboardLocation) return;
                var iFrameChild = Ext.create('Ext.ux.IFrame', {
                    itemId: 'dashboardIframe',
                    src: dashboardLocation
                });

                me.reportPanel.add(iFrameChild);
            }
        });

    },

});
