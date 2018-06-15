
/**
 * @class  Taco.view.order.widget.GiftCardForm
 * @author Shel Keller
 * @description The form for adding gateway giftcards. See EcommerceGiftCardForm for other digital credits. 
 */
Ext.define('Taco.view.order.widget.GiftCardForm', {
    extend: 'Ext.form.FieldContainer',
    requires: [
        'Taco.core.ux.form.CurrencyField'
    ],
    id: "giftCardForm",
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    getAmountToApplyField: function() {
        return this._totalField || (this._totalField = this.down('#totalField'));
    },
    getGiftCardNumberField: function() {
        return this._giftCardNumberField || (this._giftCardCodeField = this.down('#giftCardNumberField'));
    },
    getSecurityCodeField: function () {
        return this._giftCardSecurityCodeField || (this._giftCardSecurityCodeField = this.down('#giftCardSecurityCodeField'));
    },
    getGiftCardBalanceField: function () {
        return this._giftCardBalanceField || (this._giftCardBalanceField = this.down('#giftCardBalanceField'));
    },
    fetchGiftCard: function (number, securityCode) {
        console.log('fetchGiftCard');
        // TODO: make api call to get gift card using card number and security code
    },
    initComponent: function() {

        var me = this;
        //TODO: 
        //amountToApply field is numerical and needs currency filtering 
        //
        // in actions: 
        // getBalance 
            // return error if gift card number field is empty 
            // Gets value of security code and gift card number field
            // calls fetchGiftCard
            // 
   
        me.actions = {
            getBalance: Ext.create('Ext.Action', {
                text: 'Check Balance',
                ui: "action",
                scale: "medium",
                margin:'21 0 0 10',
                handler: function() {
                    var numberField = me.getGiftCardNumberField(),
                        number = numberField.getValue(),
                        securityCodeField = me.getSecurityCodeField(),
                        balanceField = me.getGiftCardBalanceField(),
                        securityCode = securityCodeField.getValue();
                    // prevent submit with empty data;
                    if (!number || !securityCode) {
                        return
                    }
                   
                    me.setLoading("Loading...");
                    me.fetchGiftCard(number, securityCode).then(function (res) {
                        var amountRemaining = res.data.amountRemaining;
                        //TODO: change to currency
                        balanceField.html(amountRemaining);
                        balanceField.show();
                    })

                    me.getGiftCardBalanceField().show();
                    //me.setDisplayedItems();
                }
            })
        }

        this.items = [
            {
                xtype: 'container', 
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                width: '100%',
                defaults: {
                    margin: '0 10 0 10'
                },
                itemId: 'applyForm',
                items: [
                    {
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'top'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'giftCardNumber',
                                fieldLabel: 'Gift Card Number',
                                itemId: 'giftCardNumberField',
                                allowBlank: false,
                                invalidText: 'The gift card number you entered is not valid.',
                                msgTarget: 'giftCardErrorEl',
                                autoFitErrors: false,
                                listeners: {
                                    specialkey: function (field, e) {
                                        // TODO: Enter key should check if both code and number are entered
                                        // If they are we try to check the balance
                                        if (e.getKey() === e.ENTER) me.actions.applyGiftCard.execute();
                                    },
                                    // ugh, cellediting cancel blurs this field when you focus it
                                    focus: function (field) {
                                        field.focusTS = new Date().getTime();
                                    },
                                    blur: function (field) {
                                        if (new Date().getTime() - field.focusTS < 200) {
                                            field.focus(false, 50);
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'textfield',
                                fieldLabel: 'Amount to Apply',
                                allowBlank: false,
                                name: 'applyAmount',
                                itemId: 'applyAmountField'
                                //validator: function (val) {
                                //    //must be a currency/number?
                                //    return true;
                                //}
                            }
                        ]
                    }, 
                    {
                        xtype: 'container',
                        layout: {
                            type: 'vbox',
                            align: 'top'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'securityCode',
                                fieldLabel: 'Security Code',
                                itemId: 'giftCardSecurityCodeField',
                                allowBlank: false,
                                invalidText: 'The security code entered was not valid.',
                                msgTarget: 'giftCardErrorEl',
                                autoFitErrors: false,
                                listeners: {
                                    // ugh, cellediting cancel blurs this field when you focus it
                                    focus: function (field) {
                                        field.focusTS = new Date().getTime();
                                    },
                                    blur: function (field) {
                                        if (new Date().getTime() - field.focusTS < 200) {
                                            field.focus(false, 50);
                                        }
                                    }
                                }
                            },
                            Ext.widget({
                                xtype: 'box',
                                anchor: 0,
                                margin: '30 0 0 0',
                                hidden: true,
                                itemId: 'giftCardBalanceField',
                                autoEl: {
                                    tag: 'h3',
                                    html: '$123.45'
                                }
                            }), 
                            this.checkBalanceButton = Ext.create('Ext.button.Button', this.actions.getBalance),
                        ]
                    }

                ]
            },
            {
                xtype: 'component',
                html: '<div role="alert" aria-live="polite" class="x-form-invalid-under" colspan="2"><ul class="x-list-plain"><li id="giftCardErrorEl"></li></ul></div>'
            }
        ];
        this.callParent(arguments);

    }
    });