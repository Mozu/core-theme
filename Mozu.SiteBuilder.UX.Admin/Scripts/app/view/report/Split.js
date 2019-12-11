/**
 * @class Taco.view.report.Split
 */


Ext.define('Taco.view.report.Split', {
    extend: 'Taco.core.ux.content.SplitContainer',
    requires: [
        'Taco.core.ux.mixins.SplitEditor'
    ],
    alias: [
       'widget.reports-split',
       'widget.reports.split'
    ],
    mixins: {
        splitEditor: 'Taco.core.ux.mixins.SplitEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    title: 'Reports',

    cls: 'taco-reporting-view reports-header',
    hideContextSwitcherBar: true,
    padding: '0 0 0 0',
    contextConfig: {
        supportedLevels: ['t', 's'],
        requiresContextOfType: ['t', 's']
    },
    initComponent: function () {

        var me = this;

       
        var currentDate = new Date();

        var ctxSwitcher = Ext.create('Taco.view.navigation.ContextSwitcherSelector', {
            callToActionText: ''
        });

        ctxSwitcher.store.insert(0, {
            text: 'All Sites',
            value: 0,
            type: 'tenant'
        });

        var store = ctxSwitcher.store;
        me.actions = [
            '->',
            {
                xtype: 'combobox',
                fieldLabel: 'Choose Site',
                store: store,
                flex: 1,
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                itemId: 'siteField',
                editable: false,
                forceSelection: true,
                width: 300,
                style: 'color: white !important',
                //initialValue: 0,
                afterRender: function(eOpts) {
                    this.setValue(0);
                }
            },
            {
                xtype: 'component',
                html: 'Date Range',
                cls: 'taco-reporting-item',
                style: "font-size: 18px, background: transparent",
                height: 1
            },
            {
                xtype: 'datefield',
                name: 'fromDate',
                fieldLabel: 'From',
                minDate: new Date(),
                itemId: 'fromDateField',
                cls: 'taco-reporting-item',
                afterRender: function (eOpts) {
                    var monthBack = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate(), 0, 0, 0, 0);
                    this.setValue(monthBack);
                }

            },
            {
                xtype: 'datefield',
                name: 'toDate',
                fieldLabel: 'To',
                minDate: new Date(),
                itemId: 'toDateField',
                cls: 'taco-reporting-item',
                afterRender: function (eOpts) {
                    this.setValue(currentDate);
                }
            },
            {
                xtype: 'button',
                ui: 'action-primary',
                scale: 'medium',
                text: 'Run Report',
                itemId: 'reportButton',
                buttonGroup: 'reports',
                allowDepress: false,
                enableToggle: true,
                margin: '0 0 0 10',
                height: 40,
                scope: this,
                handler: function () {
                    me.loadDashboard();
                }
            }
        ];

        me.config.west = [me.eastGrid()];

        me.config.east = [me.westGrid()];

       me.mixins.navHeader.init.apply(this);
        me.callParent(arguments);
        me.east.flex = 1500;

    },
    /*getContextSwitcher: function() {
        var ctxSwitcher = Ext.create('Taco.view.navigation.ContextSwitcherSelector', {
            callToActionText: ''
        });

        // we have the tenant info
        var tenant = Taco.app.context.getContextAtLevel('t');

        ctxSwitcher.store.insert(0, {
            text: 'All Sites',
            value: null, //per sanjay, he wants the value to be null
            type: 'tenant'
        });

        return ctxSwitcher;
    },*/
    eastGrid: function () {

        this.reportGrid = Ext.create('Taco.view.report.ReportList', {
            //title: 'Reports',
            autoSelectFirstItem: false
        });

        return Ext.create('Ext.panel.Panel', {
            layout: 'card',
            items: [
               this.reportGrid
            ]
        });
    },

    westGrid: function () {
        return Ext.create('Ext.panel.Panel', {
            layout: {
                type: 'card'
            },
            itemId: 'reportHolder',
            title: false,
            minWidth: 600,
            split: true,
            items: [
                {
                    xtype: 'panel',
                    layout: {
                        type: 'fit'
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
    setReportId: function(id) {
        this.chartioId = id;
        this.clearReport();

        this.loadDashboard();
    },
    clearReport: function() {
        var reportIframe = this.down("#reportPanel").down("#dashboardIframe");
        if (reportIframe)
            reportIframe.destroy();

    },
    loadDashboard: function () {
        var me = this;
        me.reportPanel = me.down("#reportPanel");
        if (!me.chartioId) return;



        Ext.Ajax.request({
            url: '/admin/app/report/chartiodashboard',
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
