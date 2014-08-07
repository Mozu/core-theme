
/**
 * @class  Taco.view.order.widget.GiftCardForm
 * @author James Zetlen
 * @description The form for adding gift cards, includes a grid
 */
Ext.define('Taco.view.order.widget.GiftCardForm', {
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

        this.actions = {
            applyGiftCard: Ext.create('Ext.Action', {
                text: 'Apply Card',
                handler: function() {
                    var codeField = me.getGiftCardCodeField(),
                        code = codeField.getValue();
                    Taco.model.StoreCredit.load(code, {
                        scope: me,
                        callback: function(validCredit) {

                            // validation
                            var errorText;
                            if (!validCredit) return codeField.markInvalid([codeField.invalidText]);
                            var now = new Date().getTime(),
                                expDate = validCredit.get('expirationDate'),
                                activationDate = validCredit.get('activationDate');
                            if (expDate < now) errorText = "expired on " + expDate.toString();
                            if (activationDate > now) errorText = "does not become active until " + activationDate.toString();
                            if (validCredit.get('currentBalance') <= 0) errorText = "has no remaining funds.";
                            if (validCredit.get('customerId')) errorText = "has already been claimed.";
                            if (errorText) return codeField.markInvalid(["Credit code " + code + " " + errorText]);
                            
                            me.store.add(validCredit);
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
                        fieldLabel: 'Gift Card Code',
                        itemId: 'giftCardCodeField',
                        width: 380,
                        invalidText: 'The gift card code you entered is not valid.',
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
                    this.applyButton = new Ext.button.Button(this.actions.applyGiftCard),
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
                    viewready: function(grid) {
                        grid.startInitialEdit();
                    },
                    amountchanged: function(amount) {
                        this.getTotalField().setValue(amount);
                    },
                    scope: this
                }
            }
        ];

        this.applyButton.setScale('medium');
        this.applyButton.setUI('action');
        this.applyButton.setMargin('41 0 0 10');

        this.callParent(arguments);

    }
    });