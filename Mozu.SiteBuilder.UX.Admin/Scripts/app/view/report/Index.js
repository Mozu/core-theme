Ext.define('Taco.view.report.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
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
        Ext.define('MyReader', {
            extend: 'Ext.data.reader.Json',
            alias: 'reader.report-json',
            read: function (object) {
                // extract blah blah...
                console.log('report obj', object);

                var rep = this.callParent([object]);
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
                url: '/admin/app/report/readExt/' + def.key,
                extraParams: criteria,
                // TODO...
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



        this.body.removeAll();
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
        this.body.add(newGrid);
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Reports for [TODO]'
            //actions: [
            //    {
            //        xtype: 'splitbutton',
            //        scale: 'medium',
            //        text: 'Export Report',
            //        plain: true,
            //        shadow: false,
            //        ui: 'action',
            //        menu: {
            //            plain: true,
            //            shadow: false,
            //            items: [{
            //                text: 'My Account',
            //                plain: true,
            //                handler: function() {
            //                    Taco.app.StateManager.attemptNavigate('account');
            //                }
            //            }, {}
            //            ]}
            //    }
            //]
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
                    location.href = '/admin/app/report/download/' + def.key + '?' + Ext.urlEncode(req.criteria);
                }
            }
        });

        Ext.apply(this.body, {
            layout: {
                type: 'fit'
            },
            items: [this.grid]
        });

        this.sidebar = {
            items: [this.sidebar]
        };

        this.callParent(arguments);
    }
})
