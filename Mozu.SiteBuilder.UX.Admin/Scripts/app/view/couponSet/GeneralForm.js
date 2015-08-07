/**
 * @class  Taco.view.discount.GeneralForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.couponSet.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-couponset-general',
    require: [
        'Taco.core.ux.TooltipLabel'
    ],
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'General',
    isCreateMode: false,

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
            //endDateFieldName: 'activeEndDate',
            pickerOffset: 4,
            allowBlank: true,
            validator: function() {
                return !me.productInCatalogInfo ||
                    me.validateDateRange(me.activeStartDateField, me.activeEndDateField, "Start date must be before end date");
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
            validator: function(val) {
                return !me.productInCatalogInfo ||
                    me.validateDateRange(me.activeStartDateField, me.activeEndDateField, "End date must be after start date");
            }
        });

        this.redemptionsPerCode = Ext.create('Ext.form.field.Number',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.limitations.maxRedemptionCount', me, {
                name: 'maxRedemptionsPerCouponCode',
                hideTrigger: true,
                width: twoColumnFieldWidth,
                margin: "0 50 0 0",
                fieldLabel: 'Max Redemptions per Code',
                emptyText: 'Unlimited',
                minValue: 0
            })
        );

        this.redemptionsPerUser = Ext.create('Ext.form.field.Number',{
                name: 'maxRedemptionsPerUser',
                hideTrigger: true,
                width: twoColumnFieldWidth,
                margin: "0 0 0 0",
                fieldLabel: 'Max Redemptions per Customer',
                emptyText: 'Unlimited',
                minValue: 0
            }
        );

        //this.discountTypeData = Ext.create('Ext.data.Store', {
        //    autoLoad: true,
        //    fields: ['name', 'value'],
        //    data: [
        //        { name: "Percentage", value: "Percentage" },
        //        { name: "Amount", value: "Amount" },
        //        { name: "Free", value: "Free" },
        //        { name: 'Fixed Price', value: 'FixedPrice' }
        //    ],
        //    filters: [
        //        function (item) {
        //            return (item.get('value') !== 'FixedPrice' && item.get('value') !== 'Free') ||
        //                (me.record.get('scope') === 'LineItem' || me.record.get('target') === 'Shipping');
        //        }
        //    ]
        //});
        //
        //this.amountTypeInput = Ext.create('Ext.form.field.ComboBox',
        //    Taco.core.ux.TooltipLabel.wrapConfig('discount.general.amountType', me, {
        //        name: 'amountType',
        //        fieldLabel: "Type",
        //        labelAlign: 'top',
        //        allowBlank: false,
        //        editable: false,
        //        forceSelection: true,
        //        displayField: 'name',
        //        valueField: 'value',
        //        width: 295,
        //        store: this.discountTypeData,
        //        queryMode: 'local',
        //        listeners: {
        //            change: function (cmp, newV, oldV) {
        //                this.updateAmountField();
        //            },
        //            scope: this
        //        }
        //    })
        //);
        //
        //var amountFieldLabel = "";
        //switch (this.record.get("amountType")) {
        //    case "Percentage":
        //        amountFieldLabel = "Percentage Off";
        //        break;
        //    case "Free":
        //        break;
        //    case "Amount":
        //        amountFieldLabel = "Amount Off";
        //        break;
        //    case "FixedPrice":
        //        amountFieldLabel = "Price";
        //        break;
        //}
        //
        //this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
        //    name: 'amount',
        //    allowBlank:false,
        //    fieldLabel: amountFieldLabel,
        //    minValue: 0.01,
        //    width: 295,
        //    margin: '0 0 0 10',
        //    forcePrecision: (this.record.get('amountType') === 'Amount'),
        //    unitAtEnd: this.record.get('amountType') === 'Percentage' ? true : false,
        //    unitString: (this.record.get('amountType') === 'Percentage') ? '%' : Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol,
        //    hideTrigger: true,
        //    disabled: (this.record.get('amountType') === 'Free') ? true : false,
        //    hidden: (this.record.get('amountType') === 'Free') ? true : false
        //});

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

            //, {
            //    xtype: 'container',
            //    layout: {
            //        type: 'hbox',
            //        align: 'top'
            //    },
            //    width: 600,
            //    items: [
            //        this.amountTypeInput,
            //        this.amountInput
            //    ]
            //}
        ];

        this.callParent(arguments);
    },

    //updateAmountField : function() {
    //    var me = this,
    //        newValue = this.amountTypeInput.getValue(),
    //        amountInputLabel = "",
    //        amountInputVisible = true;
    //
    //    function setCurrencyInput() {
    //        me.amountInput.unitString = Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol;
    //        me.amountInput.unitAtEnd = false;
    //    }
    //
    //    switch (newValue) {
    //        case "Percentage":
    //            me.amountInput.unitString = '%';
    //            me.amountInput.unitAtEnd = true;
    //            amountInputLabel = "Percentage Off";
    //            amountInputVisible = true;
    //            break;
    //        case "Free":
    //            amountInputVisible = false;
    //            break;
    //        case "Amount":
    //            setCurrencyInput();
    //            amountInputLabel = "Amount Off";
    //            amountInputVisible = true;
    //            break;
    //        case "FixedPrice":
    //            setCurrencyInput();
    //            amountInputLabel = "Price";
    //            amountInputVisible = true;
    //            break;
    //    }
    //
    //    me.amountInput.setVisible(amountInputVisible);
    //    me.amountInput.setDisabled(!amountInputVisible);
    //    me.amountInput.setFieldLabel(amountInputLabel);
    //
    //
    //    if  (newValue == 'Free') {
    //        me.amountInput.setValue(null);
    //    } else {
    //        me.amountInput.setValue(this.amountInput.value);
    //    }
    //
    //
    //    me.amountInput.clearInvalid();
    //    // notify the parent form. limitations will need to adjust to the value;
    //    // see this.maxDiscountOrderValue
    //    this.parentForm.setFieldVisibility();
    //
    //},
    //
    //isOrder: function () {
    //    return this.scopeTypeInput.getValue() === 'Order';
    //},
    //
    //isLineItem: function () {
    //    return this.scopeTypeInput.getValue() === 'LineItem';
    //},
    //
    //appliesToShipping: function () {
    //    return this.targetTypeInput.getValue() === 'Shipping';
    //},
    //
    //filterFixedPriceOptionWhenOrderProduct: function (appliesTo, affects) {
    //    var isLineItem = appliesTo ? appliesTo === 'LineItem' : this.isLineItem(),
    //        isShipping = affects ? affects === 'Shipping' : this.appliesToShipping();
    //    if (isLineItem || isShipping) {
    //        //add fixed price
    //        this.amountTypeInput.store.clearFilter(false);
    //    } else {
    //        //filter fixed price.
    //        this.amountTypeInput.store.filterBy(function(item) {
    //             return (item.get('value') !== 'FixedPrice' && item.get('value') !== 'Free');
    //        });
    //
    //        if (this.amountTypeInput.getValue() === 'FixedPrice' || this.amountTypeInput.getValue() === 'Free') {
    //            this.amountTypeInput.setValue('Percentage');
    //            Taco.app.fireEvent('setmessage', 'The chosen discount type is not applicable to Order level discounts affecting products. Please choose another discount type.', 'warning');
    //        }
    //    }
    //},

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});