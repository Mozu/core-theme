/**
 * @class  Taco.view.discount.GeneralForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.couponSet.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-couponset-general',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation'
    ],
    ui: 'subform',
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: Localizer.langResources.MARKETING.CouponSets.general_title,
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
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.name,
            labelAlign: 'top',
            allowBlank: false,
            width: 600,
            enforceMaxLength: true,
            maxLength: 200,
            emptyText: Localizer.langResources.MARKETING.CouponSets.coupon_set_name_empty_text
        });

        this.activeStartDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.start_date,
            name: 'startDate',
            width: twoColumnFieldWidth,
            margin: "0 50 0 0",
            itemId: 'startDt',
            pickerOffset: 4,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField,
                    Localizer.langResources.MARKETING.CouponSets.start_date_validation_msg, 0);
            }
        });

        this.activeEndDateField = Ext.widget({
            xtype: 'datetime',
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.end_date,
            name: 'endDate',
            itemId: 'endDt',
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            pickerOffset: 4,
            allowBlank: true,
            validator: function() {
                return Taco.core.util.Validation.validateDateRange(me.activeStartDateField, me.activeEndDateField,
                    Localizer.langResources.MARKETING.CouponSets.end_date_validation_msg, 0);
            }
        });

        this.redemptionsPerCode = Ext.create('Ext.form.field.Number',
            {
                name: 'maxRedemptionsPerCouponCode',
                hideTrigger: true,
                width: twoColumnFieldWidth,
                margin: "0 50 0 0",
                fieldLabel: Localizer.langResources.MARKETING.CouponSets.max_redemptions,
                emptyText: Localizer.langResources.MARKETING.CouponSets.defaults_to_one_empty_text,
                value: 1,
                minValue: 1
            }
        );

        this.redemptionsPerUser = Ext.create('Ext.form.field.Number', {
            name: 'maxRedemptionsPerUser',
            hideTrigger: true,
            width: twoColumnFieldWidth,
            margin: "0 0 0 0",
            fieldLabel: Localizer.langResources.MARKETING.CouponSets.max_Redemptions_per_customer,
            emptyText: Localizer.langResources.MARKETING.CouponSets.defaults_to_one_empty_text,
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