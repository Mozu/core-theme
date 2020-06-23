
/**
 * @class  Taco.view.order.widget.EcommerceGiftCardForm
 * @author James Zetlen
 * @description The form for adding gift cards, includes a grid
 */
Ext.define('Taco.view.order.widget.EcommerceGiftCardForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.view.order.widget.GiftCardGrid',
        'Taco.model.StoreCredit'
    ],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    getTotalField: function() {
        return this._totalField || (this._totalField = this.down('#totalField'));
    },
    getGiftCardCodeField: function() {
        return this._giftCardCodeField || (this._giftCardCodeField = this.down('#giftCardCodeField'));
    },
    getGiftCardGrid: function() {
        return this._giftCardGrid || (this._giftCardGrid = this.down('#giftCardGrid'));
    },
    initComponent: function() {

        var me = this;

        me.actions = {
            applyGiftCard: Ext.create('Ext.Action', {
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.apply_card,
                ui: "action",
                scale: "medium",
                margin:'41 0 0 10',
                handler: function() {
                    var codeField = me.getGiftCardCodeField(),
                        code = codeField.getValue();
                    // prevent submit with empty data;
                    if (!code) {
                        return
                    }

                    me.setLoading("Loading...");

					me.storeCreditsStore = Taco.store.StoreCredits.createByCustomCode(code, {}, true);
					me.storeCreditsStore.load({
                        callback: function (records, operation, success) {
                            me.setLoading(false);

                            if(!success) {
                                return codeField.markInvalid([codeField.invalidText]);
                            }

                            if (!records) return codeField.markInvalid([codeField.invalidText]);

                            Ext.Array.each(records, function(record){

                                var errorText;

                                var now = new Date().getTime(),
                                    expDate = record.get('expirationDate'),
                                    activationDate = record.get('activationDate');
                                if (expDate && expDate < now) errorText = Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.expired_on +" " + expDate.toString();
                                if (activationDate && activationDate > now) errorText = Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.not_become_active_until + " " + activationDate.toString();
                                if (record.get('currentBalance') <= 0) errorText = Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.no_remaining_funds;
                                if (record.get('customerId')) errorText = Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.already_claimed;

                                // check to see if the code has already been added to the store;double click on apply button.                
                                if (me.store.getById(record.getId())) {
                                    errorText = Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.already_added_below;
                                }
                                if (errorText) return codeField.markInvalid([Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.credit_code +" " + code + " " + errorText]);

                                me.store.insert(0, record);
                            })
						}
					});
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
                itemId: 'applyForm',

                items: [
                    {
                        xtype: 'textfield',
                        name: 'giftCardCode',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.gift_card_code,
                        itemId: 'giftCardCodeField',
                        width: 380,
                        invalidText: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.gift_card_not_valid,
                        msgTarget: 'giftCardErrorEl',
                        autoFitErrors: false,
                        listeners: {
                            specialkey: function(field, e) {
                                if (e.getKey() === e.ENTER) me.actions.applyGiftCard.execute();
                            },
                            // ugh, cellediting cancel blurs this field when you focus it
                            focus: function(field) {
                                field.focusTS = new Date().getTime();
                            },
                            blur: function(field) {
                                if (new Date().getTime() - field.focusTS < 200) {
                                    field.focus(false, 50);
                                }
                            }
                        }
                    },
                    this.applyButton = Ext.create('Ext.button.Button',this.actions.applyGiftCard),
                    {
                        xtype: 'textfield',
                        hidden: true,
                        allowBlank: false,
                        name: 'total',
                        itemId: 'totalField',
                        validator: function(val) {
                            return parseFloat(val) > 0;
                        }
                    }
                ]
            },
            {
                xtype: 'component',
                html: '<div role="alert" aria-live="polite" class="x-form-invalid-under" colspan="2"><ul class="x-list-plain"><li id="giftCardErrorEl"></li></ul></div>'
            },
            {
                xtype: 'taco-order-gift-card-grid',
                itemId: 'giftCardGrid',
                store: this.store,
                order: this.order,
                margin: '20 0 0 0',
                listeners: {
                    viewready: function (grid) {
                        grid.startInitialFocus();
                    },
                    amountchanged: function(amount) {
                        this.getTotalField().setValue(amount);
                    },
                    scope: this
                }
            }
        ];
        this.callParent(arguments);

    }
    });