/**
 * @class Taco.view.report.SidebarList
 * @author ojas_patel
 * Shows report list along with report criteria
 */

Ext.define('Taco.view.report.SidebarList', {
    extend: 'Ext.container.Container',

    cls: Taco.baseCSSPrefix + 'sidebarlist',
    store: null,
    reportSelector: null,

    bubbleEvents: [
        'runreport'
    ],
    
    initComponent: function () {
        var me = this;
        var reportGroupByConfigs = {};

        me.onReportChange = function () {
            var selectedReport = me.reportRadioGroup.getValue();
            if (selectedReport) {
                var selectedGroupBy = me.groupBy.getValue();
                var groupByConfig = reportGroupByConfigs[selectedReport.reportKey];
                if (groupByConfig.data.length) {
                    var store =  Ext.create('Ext.data.ArrayStore', groupByConfig);
                    me.groupBy.bindStore(store);
                    me.groupBy.enable();
                    me.groupBy.show();
                    me.groupBy.setValue(selectedGroupBy);
                    var val = me.groupBy.getValue();
                    if (val === null)
                        me.groupBy.setValue(groupByConfig.data[0][0]);
                } else {
                    me.groupBy.disable();
                    me.groupBy.hide();
                }
            }
        }

        me.reportRadioGroup = Ext.create('Ext.form.RadioGroup', {
            allowBlank: false,
            msgTarget: 'side',
            autoFitErrors: false,
            columns: 1,
            defaultType: 'container',
            items: [],
            listeners: {
                change: me.onReportChange
            }
        });

        me.store.on('load', function (store, records, opts) {
            var items = [];
            for (var i = 0; i < records.length; i++) {
                var isNewCat = i == 0 || records[i - 1].get('categoryName') != records[i].get('categoryName');
                if (isNewCat) {
                    items.push({
                        items: [ { xtype: 'component', html: '<b>' + records[i].get('categoryName') + '</b>' } ]
                    });
                }
                items[items.length - 1].items.push({ xtype: 'radiofield', boxLabel: records[i].get('name'), name: 'reportKey', inputValue: records[i].get('key'), checked: i == 0 });
                reportGroupByConfigs[records[i].get('key')] = {
                    fields: ['value', 'text'],
                    data: Ext.Array.map(records[i].raw.availableGroupBy || [], function (groupByValue) {
                        var matchingFields = Ext.Array.filter(records[i].raw.availableFields, function (field) {
                            return field.key == groupByValue;
                        });
                        var text = matchingFields.length ? matchingFields[0].name : groupByValue;
                        return [groupByValue, text];
                    })
                };
            }
            me.reportRadioGroup.removeAll();
            me.reportRadioGroup.add(items);
            me.onReportChange();
        });

        me.onDateRangeChange = function () {
            var parts = me.dateRange.getValue().split('-');
            if (parts[0]=='' && parts[1]=='') {
                me.customDateRange.show();
            } else {
                me.customDateRange.hide();
                me.customDateRange.down('[name=startDate]').setValue(parts[0]);
                me.customDateRange.down('[name=endDate]').setValue(parts[1]);
            }
        };

        //
        var dateData = [];
        (function (dateArr) {
            var appendDate = function(desc, from, to) {
                dateArr.push([desc, Ext.Date.format(from, Ext.Date.defaultFormat) + '-' + Ext.Date.format(to, Ext.Date.defaultFormat)]);
            }
            var now = new Date();
            var yday = new Date(now);
            yday.setDate(yday.getDate() - 1);

            var lastSunday = new Date(now);
            var dayOfWeek = lastSunday.getDay();
            lastSunday.setDate(lastSunday.getDate() + (dayOfWeek == 0 ? -7 : -dayOfWeek));
            startOfLastWeek = new Date(lastSunday);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 6);

            var lastDayOfLastMonth = new Date(now);
            lastDayOfLastMonth.setDate(0);
            var firstDayOfLastMonth = new Date(lastDayOfLastMonth);     
            firstDayOfLastMonth.setDate(1);

            var firstDayOfYear = new Date(now.getUTCFullYear(), 0, 1);

            var firstDayOfLastYear = new Date(now);
            firstDayOfLastYear.setYear(firstDayOfLastYear.getFullYear() - 1);
            firstDayOfLastYear.setMonth(0);
            firstDayOfLastYear.setDate(1);
            var lastDayOfLastYear = new Date(firstDayOfLastYear);
            lastDayOfLastYear.setMonth(11);
            lastDayOfLastYear.setDate(31);

            appendDate('Today', now, now);
            appendDate('Yesterday', yday, yday);
            appendDate('Last Week', startOfLastWeek, lastSunday);
            appendDate('Last Month', firstDayOfLastMonth, lastDayOfLastMonth);
            appendDate('This Year', firstDayOfYear, now);
            appendDate('Last Year', firstDayOfLastYear, lastDayOfLastYear);
            dateArr.push(['Custom', '-']);
        })(dateData);

        me.dateRange = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Date Range',
            allowBlank: false,
            value: dateData[0][1],
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: dateData
            }),
            forceSelection: true,
            emptyText: 'Select one...',
            listeners: {
//                afterrender: me.setTypeFieldVisibility,
                change: me.onDateRangeChange,
                scope: me
            }
        });

        me.groupBy = Ext.create('Ext.form.ComboBox', {
            fieldLabel: 'Group Rows By',
            allowBlank: false,
            value: 'Days',
            valueField: 'value',
            textField: 'text',
            forceSelection: true,
            emptyText: 'Select one...'
        });

        me.customDateRange = Ext.create('Ext.container.Container', {
            xtype: 'container',
            hidden: true,
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [{
                xtype: 'datefield',
                name: 'startDate',
                fieldLabel: "Start",
                emptyText: 'MM/DD/YYYY',
                allowBlank: false,
                width: 120
            }, {
                xtype: 'component',
                html: '&nbsp;to&nbsp;'
            }, {
                xtype: 'datefield',
                name: 'endDate',
                fieldLabel: "End",
                emptyText: 'MM/DD/YYYY',
                allowBlank: false,
                width: 120
            }]
        });

        me.getReportDefinition = function () {
            var formatDate = function (dt) {
                return [parts[2], parts[0], parts[1]].join('-');
            };
            var filter = '';
            var startDate = me.customDateRange.down('[name=startDate]').getValue();
            var endDate = me.customDateRange.down('[name=endDate]').getValue();
            if (startDate) {
                filter += 'days ge ' + Ext.Date.format(startDate, 'Y-m-d');
            }
            if (endDate) {
                if (startDate) {
                    filter += ' and ';
                }
                filter += 'days le ' + Ext.Date.format(endDate, 'Y-m-d');
            }

            var req = {
                name: me.reportRadioGroup.getValue().reportKey,
                criteria: {
                    filter: filter,
                    groupBy: me.groupBy.getValue()
                }
            };
            req.reportRecord = me.store.findRecord('key', req.name);
            return req;
        }

        this.items = [
            {
                xtype: 'component',
                html:  '<h2 class="' + Taco.baseCSSPrefix + 'sidebarlist-title">Report List</h2>'
            }, {
                xtype: 'form',
                items: [
                    me.reportRadioGroup,
                    me.dateRange,
                    me.customDateRange,
                    me.groupBy
                ],
                buttons: [{
                    xtype: 'splitbutton',
                    scale: 'medium',
                    text: 'View Report',
                    plain: true,
                    shadow: false,
                    ui: 'action-primary',
                    formBind: true,
                    disabled: true,
                    handler: function () {
                        me.fireEvent('runreport', me.getReportDefinition());
                    },
                    menu: {
                        plain: true,
                        shadow: false,
                        items: [{
                            text: 'Export Report (.csv)',
                            plain: true,
                            handler: function () {
                                me.fireEvent('downloadreport', me.getReportDefinition());
                            }
                        }
                        ]
                    }
                }]
            }/*
            me.reportRadioGroup,
            me.dateRange,
            me.customDateRange,
            me.groupBy,
            {
                xtype: 'container',
                padding: '20 0 0 0',
                items: [{
                    xtype: 'splitbutton',
                    scale: 'medium',
                    text: 'View Report',
                    plain: true,
                    shadow: false,
                    ui: 'action-primary',
                    handler: function () {
                        me.fireEvent('runreport', me.getReportDefinition());
                    },
                    menu: {
                        plain: true,
                        shadow: false,
                        items: [{
                            text: 'Export Report (.csv)',
                            plain: true,
                            handler: function () {
                                me.fireEvent('downloadreport', me.getReportDefinition());
                            }
                        }
                        ]
                    }
                }]
            }*/
        ];
        this.callParent(arguments);
        this.onDateRangeChange();
    }
});
