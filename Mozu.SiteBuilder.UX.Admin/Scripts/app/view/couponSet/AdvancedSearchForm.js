/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.couponSet.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this;

        this.couponSetType = Ext.widget('combobox', {
            name: 'couponCodeType',
            fieldLabel: 'Type',
            margin: { right: 40 },
            flex: 1,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: false,
            initialValue: "Active",
            trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.clearValue();
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', "name"],
                data: [
                    {
                        name: "Manual",
                        id: "Manual"
                    }, {
                        name: "Generated",
                        id: "Generated"
                    }
                ]
            }),
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    if (newVal === 'Manual') {
                        me.codePrefix.setDisabled(true);
                        me.setSizeContainer.setDisabled(true);
                    } else if (oldVal === 'Manual') {
                        me.codePrefix.setDisabled(false);
                        me.setSizeContainer.setDisabled(false);
                    }
                }
            }
        });

        this.codePrefix = Ext.widget('textfield', {
                name: 'couponSetCode',
                fieldLabel: 'Code Prefix',
                disabled: me.couponSetType.getValue() === 'Manual'
            }
        );

        this.setSizeContainer = Ext.widget('fieldcontainer', {
            fieldLabel: 'Generated Coupon Count',
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'numberfield',
                name: 'setSizeFrom',
                hideTrigger: true,
                minValue: 0,
                mouseWheelEnabled: true,
                selectOnFocus: true,
                width:100
            }, {
                xtype: 'component',
                html: 'to',
                margin: '10 10'
            }, {
                xtype: 'numberfield',
                name: 'setSizeTo',
                hideTrigger: true,
                minValue: 0,
                mouseWheelEnabled: true,
                selectOnFocus: true,
                width: 100
            }]
        });

        this.items = [
            {
                name: 'couponSetName',
                fieldLabel: 'Name'
            }, {
                xtype: 'fieldcontainer',
                layout:"hbox",
                items: [this.couponSetType, {
                    xtype: 'combobox',
                    name: 'status',
                    fieldLabel: 'Status',
                    flex: 1,
                    valueField: 'id',
                    displayField: 'name',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: false,
                    forceSelection: true,
                    initialValue: "Active",
                    trigger2Cls: 'x-form-clear-trigger',
                    onTrigger2Click: function () {                        
                        this.clearValue();
                    },
                    store: Ext.create('Ext.data.Store', {
                        fields: ['id', "name"],
                        data: [
                            {
                                name: "Active",
                                id: "Active"
                            }, {
                                name: "Scheduled",
                                id: "Scheduled"
                            }, {
                                name: "Ended",
                                id: "Ended"
                            }, {
                                name: "All",
                                id: "All"
                            }
                        ]
                    })
                }]
            },
            this.codePrefix,
            this.setSizeContainer, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Max Redemptions Per Coupon Code',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'maxRedemptionsPerCouponCodeFrom',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width:100
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '10 10'
                }, {
                    xtype: 'numberfield',
                    name: 'maxRedemptionsPerCouponCodeTo',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width: 100
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Max Redemptions Per User',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'numberfield',
                    name: 'maxRedemptionsPerUserFrom',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width:100
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'numberfield',
                    name: 'maxRedemptionsPerUserTo',
                    hideTrigger: true,
                    minValue: 0,
                    mouseWheelEnabled: true,
                    selectOnFocus: true,
                    width: 100
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Start Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'startDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'startDateTo',
                    flex: 1
                }]
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'End Date Range',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateFrom',
                    flex: 1
                }, {
                    xtype: 'component',
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datetime',
                    // allows the field to consume an iso foramt value;
                    altFormats: "c",
                    name: 'endDateTo',
                    flex: 1
                }]
            }
        
        ];

            
        this.callParent(arguments);
    }
});