Ext.define('Taco.view.report.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
//        'Taco.view.report.Header',
        'Taco.view.report.SidebarList',
        'Taco.core.ux.grid.Panel',
        'Taco.core.ux.TilePanel',
        'Taco.core.ux.grid.Pager',
        'Ext.util.Inflector',
        'Ext.form.Panel',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.modal.Confirmation',
        'Taco.core.ux.browser.ItemBrowser',
        'Ext.selection.CheckboxModel',
        'Taco.core.ux.browser.FilterList'
    ],

    cls: undefined,
    requiresContextOfType: 's',
    sidebar: null,
    constructor: function (conf) {
        this.callParent(arguments);
    },

    createStoreFromReportDefinition: function (def, criteria) {
        var me = this;
        Ext.define('MyReader', {
            extend: 'Ext.data.reader.Json',
            alias: 'reader.report-json',
            read: function (object) {
                var rep = this.callParent([object]);
                if (rep.success)
                {
                    var data = JSON.parse(object.responseText);
                    var summary = Ext.Array.map(data.metaData, function (item) {
                        var rv = {
                            label: item.Column.Name,
                            helpText: item.Column.HelpText,
                            value: item.Value
                        };
                        if (item.Column.DisplayFormat == 'Currency')
                            rv.value = Ext.util.Format.usMoney(rv.value)
                        else if (item.Column.DisplayFormat == 'Number')
                            rv.value = Ext.util.Format.number(rv.value, "0,000")
                        else if (item.Column.DisplayFormat == 'Percent')
                            rv.value = Ext.util.Format.number(rv.value, "0.000%")
                        return rv;
                    });
                    me.updateSummary(summary);
                }
                window.rep = rep;
                
                return rep;
                Ext.Array.each(resp.records, function (rec) {
                    rec.data.categoryName = rec.raw.category.name;
                    rec.data.name = rec.raw.content.name;
                });
                return resp;
            }
        });


        var fields = Ext.Array.map(def.availableFields, function (item) {
            return {
                "name": item.key,
                "type": item.type.toLowerCase()
            };
        });

        var store = Ext.create('Ext.data.Store', {
            autoLoad: true,
            autoSync: true,
            fields: fields,
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
        var me = this;
        me.body.items.items[0].remove(1);

        var report = req.reportRecord.raw;
        var store = this.createStoreFromReportDefinition(report, req.criteria);
        var cols = Ext.Array.map(report.availableFields, function (item) {
            return {
                hidden: !(Ext.Array.contains(report.defaultFields, item.key) || report.defaultGroupBy==item.key),
                text: item.name,
                dataIndex: item.key
            };
        });
        cols[0].flex = 1;

        var newGrid = Ext.create('Ext.grid.Panel', {
            title: req.reportRecord.get('name'),
            store: store,
            columns: cols,
            dockedItems: [
                Ext.create('Taco.core.ux.grid.Pager', {
                    store: store
                })
            ]
        });

        me.body.items.items[0].add(newGrid);
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Reports for [TODO]'
        };
        me.summaryTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="taco-order-detail-header-section xorder-data">',
                    '<label>{#} {label}</label>',
                    '<h2>{value}</h2>',
                    '<div class="status">{helpText}</div>',
                '</div>',
            '</tpl>'
        );

        me.summaryPanel = new Ext.create('Ext.Panel', {
            height: 80,
            hidden:true,
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
                window.resp = resp;
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
                        totalProperty: 'Total',
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
            items: [ {
                xtype: 'container',
                items: [ this.summaryPanel ]
            }]
        });

        this.sidebar = {
            items: [this.sidebar]
        };

        this.callParent(arguments);
    }
})
