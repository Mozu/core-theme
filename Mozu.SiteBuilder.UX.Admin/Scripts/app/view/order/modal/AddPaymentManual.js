/**
 * @class Taco.view.order.modal.AddPaymentManual
 */

Ext.define('Taco.view.order.modal.AddPaymentManual', {    
    extend: 'Taco.view.order.modal.AddPayment',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Ext.form.field.Number',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.form.FieldContainer'
    ],
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.add_manual_payment,
    initComponent: function () {
        //Note: this classes' items are added in the base class;
        this.callParent(arguments);
    },
    // remove base class methods that don't apply
    createPciProcessor : Ext.emptyFn,
    createPciFormField: Ext.emptyFn,
    getPCIaaS: Ext.emptyFn,
    getPciFieldsAdapter: Ext.emptyFn,

    // override of base class;
    getPaymentForm: function () {
        var cardTypeStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.ConfiguredCreditCards'
        });
        cardTypeStore.removeAt(cardTypeStore.find('key', 'GIFTCARD'));
        return {
            xtype: 'container',
            anchor: 0,
            items: [{
                xtype: 'container',
                anchor: 0,
                layout: 'hbox',
                defaults: {
                    margin: '0 20 0 0'
                },
                items: [
                   {
                       xtype: 'textfield',
                       name: 'gatewayTransactionId',
                       flex:1,
                       fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.gateway_transaction_id
                   }, {
                       xtype: 'numberfield',
                       name: 'gatewayInteractionId',
                       hideTrigger: true,
                       flex: 1,
                       mouseWheelEnabled: false,
                       fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.gateway_interaction_id
                   }, {
                       xtype: 'combobox',
                       name: 'actionName',
                       fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.interaction_type,
                       allowBlank: false,
                       flex: 1,
                       forceSelection: true,
                        store: [['AuthorizePayment', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.authorize_only], ['AuthAndCapture', Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.authorize_and_capture]],
                       value: 'AuthorizePayment',
                       margin: '0 0 0 0'
                   }
                ]
            }, {
                xtype: 'container',
                layout: 'hbox',
                defaults: {
                    margin: '0 20 0 0',
                    flex: 1
                },
                items: [
                    {
                        xtype: 'datetime',
                        name: 'interactionDate',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.transaction_date
                    },  {
                        xtype: 'combobox',
                        name: 'cardType',
                        itemId: 'cardType',
                        valueField: 'Key',
                        displayField: 'Value',
                        fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.card_type,
                        queryMode: 'local',
                        allowBlank: false,
                        editable: false,
                        forceSelection: true,
                        store: cardTypeStore
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        margin: '0 0 0 0',
                        defaults: {
                            margin: '0 20 0 0',
                            flex: 1
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'cardLastFour',
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.last_four_digits,
                                minLength: 4,
                                maxLength: 4,
                                enforceMaxLength: true,
                                validateOnChange:false,
                                emptyText: '1111'
                            }, {
                                xtype: 'currencyfield',
                                currencyCode: this.record.getCurrencyCode(),
                                name: 'amount',
                                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.amount,
                                selectOnFocus:true,
                                validateOnChange: true,
                                allowBlank: false,
                                minValue:0.01,
                                value: this.getDefaultPaymentAmount(),
                                margin: '0 0 0 0'
                            }
                        ]
                    }
                ]
            }

            ]
        };
    },


    doSave: function () {
        var me = this,
            formValues = this.form.getValues(),
            transactionId = formValues.gatewayTransactionId,
            interactionId = formValues.gatewayInteractionId,
            actionName = formValues.actionName,
            amount = formValues.amount,
            cardInfo;

        cardInfo = {
            nameOnCard: formValues.nameOnCard,
            cardType: formValues.cardType,
            cardNumber: '************' + formValues.cardLastFour,
            expireMonth: formValues.expireMonth,
            expireYear: formValues.expireYear
        };

        me.record.addManualPayment({
            jsonData: {
                orderId: this.record.getId(),
                billingInfo: cardInfo,
                interactionDate: formValues.interactionDate,
                amount: amount,
                gatewayTransactionId: transactionId,
                gatewayInteractionId: interactionId,
                actionName: actionName
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json || !json.success) {                    
                    return;
                }

                data = json.items;
                me.record.reload();
                me.saveSuccess(data);
            }
        });
    }

});
