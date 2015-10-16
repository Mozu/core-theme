/**
 * @class  Taco.view.searchTuningRule.ContextForm
 * @author Travis Johnson
 * @description SearchTuningRule Context Form
 */
Ext.define('Taco.view.searchTuningRule.ContextForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.searchTuningRule-context',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation'
    ],
    ui: 'subform',
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: 'Contexts',
    config: {
        isCreateMode: false
    },

    initComponent: function() {
        var me = this;
        // horizontal space between fields
        var defaultFieldMargin = 50;
        // how wide should fields be that display currency amounts
        var defaultFieldWidth = 166; // 3 column width
        //widest width that will fit in an override container at the smallest browser width;
        var fullFieldWidth = (defaultFieldWidth * 3) + (2 * defaultFieldMargin);
        // field width when part of a two column layout
        var twoColumnFieldWidth = (fullFieldWidth / 2)  -  (defaultFieldMargin/2);

        Ext.tip.QuickTipManager.init();

        this.nameInput = Ext.create('Ext.form.field.Text', {
            name: 'name',
            fieldLabel: "Name",
            labelAlign: 'top',
            allowBlank: false,
            width: 600,
            enforceMaxLength: true,
            maxLength: 200,
            emptyText: 'Enter a coupon set name'
        });

        this.activeStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'Start Date',
            name: 'startDate',
            width: twoColumnFieldWidth,
            margin: "0 50 0 0",
            itemId: 'startDt',
            pickerOffset: 4,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField,
                    "Start date must be before end date", 0);
            }
        });

        this.activeEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: 'End Date',
            name: 'endDate',
            itemId: 'endDt',
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            pickerOffset: 4,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField,
                    "End date must be after start date", 0);
            }
        });

        this.redemptionsPerCode = Ext.create('Ext.form.field.Number',
            {
                name: 'maxRedemptionsPerCouponCode',
                hideTrigger: true,
                width: twoColumnFieldWidth,
                margin: "0 50 0 0",
                fieldLabel: 'Max Redemptions (Per Code)',
                emptyText: 'Defaults to 1',
                value: 1,
                minValue: 1
            }
        );

        this.redemptionsPerUser = Ext.create('Ext.form.field.Number', {
            name: 'maxRedemptionsPerUser',
            hideTrigger: true,
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            fieldLabel: 'Max Redemptions per Customer (Per Code)',
            emptyText: 'Defaults to 1',
            value: 1,
            minValue: 1
            }
        );

        this.items = [
            this.nameInput,
            {
                xtype: 'fieldcontainer',
                startDate: this.activeStartDateField,
                endDate: this.activeEndDateField,
                layout: 'hbox',
                width: '100%',
                items: [
                    this.activeStartDateField,
                    this.activeEndDateField
                ]
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    this.redemptionsPerCode,
                    this.redemptionsPerUser
                ]
            }
        ];

        //this.mon(Taco.app, 'couponsetcreated', function (data) {
            //if (!me.redemptionsPerCode.getValue()){
            //    me.redemptionsPerCode.setValue(data.get('maxRedemptionsPerCouponCode'));
            //}
            //if (!me.redemptionsPerUser.getValue()){
            //    me.redemptionsPerUser.setValue(data.get('maxRedemptionsPerUser'));
            //}
        //}, me);

        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});