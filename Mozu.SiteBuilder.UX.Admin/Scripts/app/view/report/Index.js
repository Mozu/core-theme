Ext.define('Taco.view.report.Index', {
    extend: 'Ext.panel.Panel',
    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        permissions: 'Taco.core.ux.mixins.Permissions'
    },
    requires: [
        'Ext.ux.IFrame',
        'Taco.view.navigation.ContextSwitcher',
        'Taco.core.ux.content.SiteViewDropdown',
        'Taco.view.navigation.ContextSwitcherSelector'
    ],
    title: 'Reports',
    //gridHeaderLabel: 'Reports',
    itemId: 'reportView',
    contextConfig: {
        supportedLevels: [ 't','s'],
        requiresContextOfType: [ 't', 's']
    },
    enableSearchBarInHeader: true,

    //formCls: 'Taco.core.ux.form.Form',
    enableNavHeader: true,
    autoTitle: true,
    createButtonEnabled: false,
    dontFloatHeaderButtons: true,
    cls: 'taco-reporting-view',
    hideContextSwitcherBar: true,
    cancelButtonEnabled: false,
    options: {},
    saveButtonEnabled: false,
    layout: {
        type: 'fit'
    },
    padding: '0 0 0 0',
    //autoScroll: false,
    initComponent: function () {

        var me = this;

        var contextSwitcher = this.getContextSwitcher();

        me.titlePanel = contextSwitcher;

        me.actions = [
            '->',
            {
                xtype: 'component',
                html: 'Date Range',
                cls: 'taco-reporting-item',
                style: "font-size: 18px",
                height: 1
            },
            {
                xtype: 'datefield',
                name: 'fromDate',
                fieldLabel: 'From',
                minDate: new Date(),
                itemId: 'fromDateField',
                cls: 'taco-reporting-item'

            },
            {
                xtype: 'datefield',
                name: 'toDate',
                fieldLabel: 'To',
                minDate: new Date(),
                itemId: 'toDateField',
                cls: 'taco-reporting-item'
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

        me.items = [
            {
                xtype: 'panel',
                layout: {
                    type: 'fit'
                },
                itemId: 'dashboardPanel',
                border: false
            }
        ];

        if (this.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        }
        me.callParent(arguments);

        me.dashboardPanel = me.down("#dashboardPanel");
        
    },
    getFieldValue: function (itemId) {
        if (!itemId || !this.down(itemId)) {
            return false;
        }

        return this.down(itemId).getValue();
    },
   
    loadDashboard: function () {
        var me = this;
        Ext.Ajax.request({
            url: '/admin/app/report/dashboard',
            method: 'POST',
            params: {
                fromDate: me.getFieldValue('#fromDateField'),
                toDate: me.getFieldValue('#toDateField')
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

                me.dashboardPanel.add(iFrameChild);
            }
        });
       
    },

    getContextSwitcher: function() {
        var ctxSwitcher = Ext.create('Taco.view.navigation.ContextSwitcherSelector', {
            callToActionText: 'Switch Context'
        });

        // we have the tenant info
        var tenant = Taco.app.context.getContextAtLevel('t');

        ctxSwitcher.store.insert(0, {
            text: 'All Sites',
            value: null, //per sanjay, he wants the value to be null
            type: 'tenant'
        });

        return ctxSwitcher;
    }
})
