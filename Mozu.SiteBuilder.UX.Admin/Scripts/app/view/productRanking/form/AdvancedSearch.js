/**
 * @class Taco.view.productRanking.form.AdvancedSearch
 */
Ext.define('Taco.view.productRanking.form.AdvancedSearch', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser',
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },

    initComponent: function () {
        var me = this;

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        name: 'name',
                        fieldLabel: 'Name',
                        margin: { right: 40 },
                        flex: 1
                    }, {
                        xtype: 'textfield',
                        name: 'code',
                        fieldLabel: 'Code',
                        flex: 1
                    }
                ]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [
                    me.createStaticCombobox('status', 'Status', [
                        {
                            name: 'Active',  //todo: can't do scheduled greg_murray on 10/21/2015
                            id: 'Active'
                        }, {
                            name: 'Disabled',
                            id: 'Disabled'
                        }, {
                            name: 'All',
                            id: 'All'
                        }
                    ], 40),
                    me.createStaticCombobox('default', 'Default', [
                        {
                            name: 'Yes',
                            id: 'true'
                        }, {
                            name: 'No',
                            id: 'false'
                        }
                    ], 0)
                ]
            }, {
                xtype: 'combo',
                store: { type: 'Taco.store.Categories' },
                flex:1,
                name: 'categoryCode',
                fieldLabel: 'Category',
                valueField: 'id',
                displayField: 'nameAndCode',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true,
                listeners: {
                    added: function (cmp) {
                        cmp.hidden = !Taco.app.context.getCurrent().getSiteId();
                    }
                }
            },
            me.createDateRangeFields('Active Start Date Range', 'activeStartDateFrom', 'activeStartDateTo'),
            me.createDateRangeFields('Active End Date Range', 'activeEndDateFrom', 'activeEndDateTo'),
            {
                xtype: 'taco-adminuserfield',
                name: 'createdBy',
                fieldLabel: 'Created By',
                flex: 1
            },
            me.createDateRangeFields('Created Date Range', 'createDateFrom', 'createDateTo'),
            {
                xtype: 'taco-adminuserfield',
                name: 'modifiedBy',
                fieldLabel: 'Last Modified By',
                flex: 1
            },
            me.createDateRangeFields('Last Modified Date Range', 'modifiedDateFrom', 'modifiedDateTo')
        ];

        this.callParent(arguments);
    },

    createDateRangeFields: function(title, start, end) {
        return {
            xtype: 'fieldcontainer',
            fieldLabel: title,
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'datetime',
                // allows the field to consume an iso foramt value;
                altFormats: 'c',
                name: start,
                flex: 1
            }, {
                xtype: 'component',
                html: 'to',
                margin: '5 10'
            }, {
                xtype: 'datetime',
                // allows the field to consume an iso foramt value;
                altFormats: 'c',
                name: end,
                flex: 1
            }]
        };
    },

    createStaticCombobox: function(name, label, data, marginRight) {
        return {
            xtype: 'combobox',
            name: name,
            fieldLabel: label,
            margin: { right: marginRight },
            flex: 1,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.clearValue();
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data: data
            })
        };
    }
});