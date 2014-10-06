/**
 * @class  Taco.view.discount.LimitationsForm
 * @author Travis Johnson
 * @description Discount Limitations Editor
 */
Ext.define('Taco.view.discount.LimitationsForm', {
    requires: [
        'Ext.data.UuidGenerator',
        'Ext.ux.form.field.BoxSelect',
        'Taco.core.ux.form.CurrencyField'
    ],
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-limitations',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Discount Limitations',

    initComponent: function () {
        //this.maximumValueInput = Ext.create('Taco.core.ux.form.CurrencyField', {
        //    name: 'maximumValue',
        //    fieldLabel: "Maximum Value",
        //    forcePrecision: true,
        //    labelAlign: 'top',
        //    width: 600,
        //    currencyCode: Taco.app.context.getCurrent().currencyCode,
        //    align: 'right',
        //    unitAtEnd: false
        //});

        this.redemptionLimits = Ext.create('Ext.form.field.Number', {
            name: 'maxRedemptionCount',
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Total Number of Redemptions: ' + (this.record.get('currentRedemptionCount') ? '&nbsp;&nbsp;&nbsp;&nbsp;<i>(current redemptions:&nbsp;' + this.record.get('currentRedemptionCount') + '</i>)' : ''),
            emptyText: 'unlimited',
            minValue: 0
        });

        this.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: 'Create coupon',
            labelAlign: 'right',
            listeners: {
                change: function (cb, newValue) {
                    this.couponCodeBox[newValue ? 'show' : 'hide']();
                },
                scope: this
            }
        });
        this.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            width: 500
        });
        this.couponCodeBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            hidden: !(this.record.get('couponCode') || this.record.get('requiresCoupon')),
            items: [
                this.couponCodeInput,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Random',
                    margin: '0 0 0 10',
                    handler: function () {
                        var randomizer = Ext.data.IdGenerator.get('uuid'),
                            code = randomizer.generate().replace(/[^0-9a-z]/g, "").substr(0, 8).toUpperCase();

                        this.couponCodeInput.setValue(code);
                    },
                    scope: this
                }
            ]
        });
        this.oneTimeUsePerShopper = Ext.create('Ext.form.field.Checkbox', {
            name: 'oneTimeUsePerShopper',
            boxLabel: 'Discount Can Be Redeemed One Time Per Shopper',
            checked: this.record.get('maximumUsesPerUser') === 1,
            listeners: {
                change: function (cb, newValue) {
                    this.record.set('maximumUsesPerUser', newValue ? 1 : 0);
                },
                scope: this
            }
        });

        this.items = [
            {
                xtype: 'component',
                html: 'Discount limitations specify the limit a coupon/discount can be redeemed.',
                margin: '15 0 0 0'
            },
            this.maximumValueInput,
            this.redemptionLimits,
            this.requiresCouponInput,
            this.couponCodeBox,
            this.oneTimeUsePerShopper
        ];


        this.callParent(arguments);
    }

    

   
});