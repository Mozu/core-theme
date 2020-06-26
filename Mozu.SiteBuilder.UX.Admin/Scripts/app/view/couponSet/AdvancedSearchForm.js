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
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.type,
            margin: { right: 40 },
            flex: 1,
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: Localizer.langResources.MARKETING.CouponSets.not_found_text,
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
                        name: Localizer.langResources.MARKETING.CouponSets.coupon_set_type_manual,
                        id: "Manual"
                    }, {
                        name: Localizer.langResources.MARKETING.CouponSets.coupon_set_type_generated,
                        id: "Generated"
                    }
                ]
            }),
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    if (newVal === Localizer.langResources.MARKETING.CouponSets.coupon_set_type_manual) {
                        me.codePrefix.setDisabled(true);
                        me.setSizeContainer.setDisabled(true);
                    } else if (oldVal === Localizer.langResources.MARKETING.CouponSets.coupon_set_type_manual) {
                        me.codePrefix.setDisabled(false);
                        me.setSizeContainer.setDisabled(false);
                    }
                }
            }
        });

        this.codePrefix = Ext.widget('textfield', {
                name: 'couponSetCode',
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.code_prefix,
                disabled: me.couponSetType.getValue() === Localizer.langResources.MARKETING.CouponSets.coupon_set_type_manual
            }
        );

        this.setSizeContainer = Ext.widget('fieldcontainer', {
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.generated_coupon_count,
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
                html: Localizer.langResources.SHARED.to_text,
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
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.name,
            }, {
                xtype: 'fieldcontainer',
                layout:"hbox",
                items: [this.couponSetType, {
                    xtype: 'combobox',
                    name: 'status',
                    fieldLabel: Localizer.langResources.MARKETING.CouponSets.status,
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
                                name: Localizer.langResources.MARKETING.CouponSets.active_status,
                                id: "Active"
                            }, {
                                name: Localizer.langResources.MARKETING.CouponSets.scheduled_status,
                                id: "Scheduled"
                            }, {
                                name: Localizer.langResources.MARKETING.CouponSets.ended_status,
                                id: "Ended"
                            }, {
                                name: Localizer.langResources.MARKETING.CouponSets.all_status,
                                id: "All"
                            }
                        ]
                    })
                }]
            },
            this.codePrefix,
            this.setSizeContainer, {
                xtype: 'fieldcontainer',
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.max_redemptions_per_coupon_code,
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
                    html: Localizer.langResources.SHARED.to_text,
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
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.max_redemptions_per_user,
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
                    html: Localizer.langResources.SHARED.to_text,
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
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.start_date_range,
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
                    html: Localizer.langResources.SHARED.to_text,
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
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.end_date_range,
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
                    html: Localizer.langResources.SHARED.to_text,
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