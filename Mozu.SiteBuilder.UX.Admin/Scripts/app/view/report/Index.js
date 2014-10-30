Ext.define('Taco.view.report.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Ext.ux.IFrame',
        'Ext.panel.Panel',
        'Taco.view.report.SidebarList',
        'Taco.core.ux.grid.Panel',
        'Taco.core.ux.TilePanel',
        'Ext.util.Inflector',
        'Ext.form.Panel',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.browser.ItemBrowser',
        'Ext.selection.CheckboxModel',
        'Taco.core.ux.browser.FilterList'
    ],

    cls: undefined,
    //just for old reporting, not birst
    sidebar: null,
    grid: null,
    //This is the var that switches between bist/old reporting
    isNonProd: Taco.showBirstReport,

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

        if (me.isNonProd) {
            //BIRST STUFF
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
        } else {
            //old reporting stuff, not birst
            me.summaryTpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<div class="taco-order-detail-header-section xorder-data">',
                        '<label>{label}</label>',
                        '<h2>{value}</h2>',
                        '<div class="status">{helpText}</div>',
                    '</div>',
                '</tpl>'
            );
    
            me.summaryPanel = new Ext.create('Ext.Panel', {
                height: 100,
                style: { 'padding': '0 0 10px 0' },
                hidden: true,
                html: ''
            });
    
    
            me.updateSummary = function (summary) {
                var html = me.summaryTpl.apply(summary);
                me.summaryPanel.show();
                me.summaryPanel.body.update(html);
            };
    
            Ext.define('MyReader', {
                extend: 'Ext.data.reader.Json',
                alias: 'reader.my-json',
                read: function (object) {
                    var resp = this.callParent([object]);
                    Ext.Array.each(resp.records, function (rec) {
                        rec.data.categoryName = rec.raw.category.name;
                        rec.data.name = rec.raw.content.name;
                    });
                    return resp;
                }
            });
    
            me.sidebarStore = Ext.create('Ext.data.Store', {
                autoLoad: true,
                autoSync: true,
                fields: [{
                    "name": "key",
                    "type": "string"
                }, {
                    "name": "name",
                    "type": "string"
                }, {
                    "name": "categoryName",
                    "type": "string"
                }],
                groupField: 'categoryName',
                groupDir: 'DESC',
                proxy: {
                    type: 'ajax',
                    url: '/admin/app/report/list',
                    reader: {
                        type: 'my-json',
                        root: 'items.items',
                        totalProperty: 'total',
                        successProperty: 'success'
                    },
                    xxreader: {
                        type: 'json',
                        root: 'items.items',
                        successProperty: 'success'
                    }
                }
            });
    
            this.sidebar = Ext.create('Taco.view.report.SidebarList', {
                store: me.sidebarStore,
                listeners: {
                    'runreport': function (req) {
                        me.loadReport(req);
                    },
                    'downloadreport': function (req) {
                        var def = req.reportRecord.raw;
                        var url = '/admin/app/report/download/' + def.key + '?' + Ext.urlEncode(req.criteria);
    
                        var win = window.open(url, '_blank');
                        win.focus();
                    }
                }
            });
    
            Ext.apply(this.body, {
                layout: {
                    type: 'fit'
                },
                style: { 'padding': '0px' },
                items: [{
                    xtype: 'panel',
                    bodyStyle: {
                        'padding': '0 0 10px 0',
                        'border-width': '0px 1px 0px 0px'
                    },
                    autoScroll: true,
                    items: [
    
    
    
                        {
                            xtype: 'panel',
                            bodyStyle: {
                                'border-width': '0px 1px 0px 0px'
                            },
                            layout: {
                                type: 'border'
                            },
                            items: [],
                            dockedItems: [
                               {
                                   xtype: 'container',
                                   dock: 'top',
                                   style: { 'background-color': 'white' },
                                   items: [this.summaryPanel]
                               }
                            //    this.summaryPanel
                            ]
                        }
    
    
    
    
                    ],
                    dockedItems: [
                       {
                           xtype: 'container',
                           dock: 'right',
                           style: { 'background-color': 'white' },
                           items: [this.sidebar]
                       }
    
                    ]
                }]
    
            });
    
            this.callParent(arguments);
            window.me = me;
            
        }
        
    },

    createStoreFromReportDefinition: function (def, criteria) {
        //just for old reporting, not birst
        var me = this;

        Ext.define('MyReader', {
            extend: 'Ext.data.reader.Json',
            alias: 'reader.report-json',
            totalProperty: 'total',
            read: function (object) {
                var rep = this.callParent([object]);
                if (rep.success) {
                    var data = JSON.parse(object.responseText);
                    var summary = Ext.Array.map(data.metaData, function (item) {
                        var rv = {
                            label: item.column.name,
                            helpText: item.column.helpText,
                            value: item.value
                        };
                        if (item.column.displayFormat == 'Currency')
                            rv.value = Ext.util.Format.usMoney(rv.value)
                        else if (item.column.displayFormat == 'Number')
                            rv.value = Ext.util.Format.number(rv.value, "0,000")
                        else if (item.column.displayFormat == 'Percent')
                            rv.value = Ext.util.Format.number(rv.value, "0.000%")
                        return rv;
                    });
                    me.updateSummary(summary);
                }
                return rep;
            }
        });


        var fields = Ext.Array.map(def.availableFields, function (item) {
            var ty = item.type.toLowerCase();
            return {
                "name": item.key,
                // terrible hack, do this the right way silly.
                "type": ty == 'date' ? 'string' : ty
            };
        });

        var store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            autoSync: true,
            fields: fields,
            pageSize: 25,
            proxy: {
                type: 'ajax',
                url: '/admin/app/report/read/' + def.key,
                extraParams: criteria,
                reader: {
                    type: 'report-json',
                    root: 'items',
                    successProperty: 'success'
                }
            }
        });
        return store;
    },

    loadReport: function (req) {
        //just for old reporting, not birst
        var me = this;

        if (me.grid) {
            me.grid.up().remove(me.grid).destroy();
            //me.body.items.items[0].items.removeAt(1).destroy()
        }

        var report = req.reportRecord.raw;
        var store = this.createStoreFromReportDefinition(report, req.criteria);
        var cols = Ext.Array.map(report.availableFields, function (item) {
            return {
                hidden: !(Ext.Array.contains(report.defaultFields, item.key) || item.key == req.criteria.groupBy),
                text: item.name,
                renderer: function (val) {
                    var displayFormat = item.displayFormat;
                    if (displayFormat == 'Number')
                        return Ext.util.Format.number(val, "0,000");
                    else if (displayFormat == 'Currency')
                        return Ext.util.Format.currency(val, '', 2);
                    else if (displayFormat == 'ShortDate') {
                        if (!val || Ext.isNumeric(val)) {
                            return val;
                        }
                        var cstDt = new Date(val);
                        var utcDt = new Date(cstDt.getUTCFullYear(), cstDt.getUTCMonth(), cstDt.getUTCDate(), cstDt.getUTCHours(), cstDt.getUTCMinutes(), cstDt.getUTCSeconds());
                        return Ext.util.Format.date(utcDt, "m/d/Y");
                    } else if (displayFormat == 'Percent' && Ext.isNumeric(val))
                        return Ext.util.Format.number(val * 100, "0.000%");
                    return val;
                },
                dataIndex: item.key
            };
        });
        if (cols.length > 0) {
            cols[0].flex = 1;
            cols[cols.length - 1].flex = 1;
        }

        me.grid = Ext.create('Ext.grid.Panel', {
            title: req.reportRecord.get('name'),
            style: { 'padding': '0 10px' },
            store: store,
            columns: cols,
            dockedItems: [
                Ext.create('Ext.toolbar.Paging', {
                    store: store,
                    displayInfo: true,
                    dock: 'bottom'
                })
            ]
        });

        me.body.items.items[0].add(me.grid);
    },

    loadDashboard: function () {
        var me = this;
        //BIRST STUFF
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
