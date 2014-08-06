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
    title: 'Add Manual Payment',
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
                       fieldLabel: 'Gateway Transaction Id'
                   }, {
                       xtype: 'numberfield',
                       name: 'gatewayInteractionId',
                       hideTrigger: true,
                       flex: 1,
                       mouseWheelEnabled: false,
                       fieldLabel: 'Gateway Interaction Id'
                   }, {
                       xtype: 'combobox',
                       name: 'actionName',
                       fieldLabel: 'Interaction Type',
                       allowBlank: false,
                       flex: 1,
                       forceSelection: true,
                       store: [['AuthorizePayment', 'Authorize Only'], ['AuthAndCapture', 'Authorize and Capture']],
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
                        fieldLabel: 'Transaction Date'
                    },  {
                        xtype: 'combobox',
                        name: 'cardType',
                        itemId: 'cardType',
                        valueField: 'Key',
                        displayField: 'Value',
                        fieldLabel: 'Card Type',
                        queryMode: 'local',
                        allowBlank: false,
                        editable: false,
                        forceSelection: true,
                        store: Taco.core.data.StoreManager.getOrCreate({
                            type: 'Taco.store.ConfiguredCreditCards'
                        })
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
                                fieldLabel: 'Last 4 Digits',
                                minLength: 4,
                                maxLength: 4,
                                enforceMaxLength: true,
                                validateOnChange:false,
                                emptyText: '1111'
                            }, {
                                xtype: 'currencyfield',
                                currencyCode: this.record.getCurrencyCode(),
                                name: 'amount',
                                fieldLabel: 'Amount',
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
