/**
 * @class Taco.view.order.modal.AddPurchaseOrder
 */
Ext.define('Taco.view.order.modal.AddPurchaseOrder', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    scale: 'large',
    title: 'Create Purchase Order',

    primaryText: 'Done',

    initComponent: function (eOpts) {

        var me = this,
            balance = me.getBalance(7099),
            limit = me.getLimit(10000),
            terms = me.record.checkoutSettings.get('purchaseOrder').paymentTerms
                    ? me.getTerms(me.record.checkoutSettings.get('purchaseOrder').paymentTerms)
                    : me.getTerms(['No terms specified']),
            fields = me.getFields(me.record.checkoutSettings.get('purchaseOrder').customFields);

        var formItems = this.getPaymentForm();

        me.form = Ext.create('Ext.form.Panel', {
            items: [
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    flex: 1,
                    items: [
                        balance,
                        limit,
                        terms,
                        {
                            flex: 3
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    items: [
                        {
                            allowBlank: false,
                            fieldLabel: 'Purchase Order #',
                            flex: 1,
                            name: 'purchaseOrderNumber',
                            xtype: 'textfield'
                        },
                        {
                            allowBlank: false,
                            currencyCode: me.record.getCurrencyCode(),
                            fieldLabel: 'Amount',
                            flex: 1,
                            margin: '0 0 0 30',
                            name: 'amount',
                            value: me.record.formatCurrency(me.record.get('total')),
                            xtype: 'textfield'
                        }
                    ]
                },
                {
                    items: fields,
                    layout: {
                        align: 'stretch',
                        type: 'vbox'
                    },
                    xtype: 'fieldcontainer'
                }
            ]
        });

        me.items = [me.form];

        this.callParent(arguments);
    },

    getPaymentForm: function () {
        var me = this;

        this.pullOrderPaymentData(this.record);

        this.pullCustomerPaymentData(this.record.customer);

        this.paymentContainer = Ext.create('Ext.container.Container', {
            anchor: 0,
            width: '100%',
            items: [],
            scope: this
        }, this);

        return this.paymentContainer;
    },

    pullOrderPaymentData: function (order) {
        this.currentPayments = order.payments().queryBy(function (payment) {
            return payment.get('paymentType') === 'PurchaseOrder';
        });
    },

    retrieveParentPaymentData: function () {
        if (this.record.get('parentOrderId') && this.record.get('parentOrderId').length > 0) {
            this.isLoading = true;
            this.retrieveOrderPaymentDataAjax(this.record.get('parentOrderId'));
        } else if (this.record.get('parentReturnId') && this.record.get('parentReturnId').length > 0) {
            this.isLoading = true;

            var me = this;

            Ext.Ajax.request({
                url: '/admin/app/return/list',
                params: {
                    id: me.record.get('parentReturnId')
                },
                method: 'GET',
                success: function (returnResponse) {
                    var returnList = JSON.parse(returnResponse.responseText).items;
                    if (returnList && returnList.length > 0) {
                        var parentOrderId = returnList[0].originalOrderId;
                        me.retrieveOrderPaymentDataAjax(parentOrderId);
                    }
                }
            });
        }
    },

    retrieveOrderPaymentDataAjax: function (orderId) {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/order/list',
            params: {
                id: orderId
            },
            method: 'GET',
            success: function (orderResponse) {
                var orderList = JSON.parse(orderResponse.responseText).items;

                me.currentPayments = me.currentPayments || [];

                if (orderList && orderList.length > 0) {
                    var paymentList = orderList[0].payments;
                    if (paymentList) {
                        for (var i = 0; i < paymentList.length; ++i) {
                            if (paymentList[i].paymentType.toLowerCase() === 'purchaseorder') {
                                me.currentPayments.push(paymentList[i]);
                            }
                        }
                    }
                }

                me.currentPayments = me.filterAndClearArrayDuplicates(me.currentPayments, false);
                me.setDisplayedItems();
                me.setModalLoading(false);
            }
        });
    },

    pullCustomerPaymentData: function (customer) {
        if (customer.get('isAnonymous') || customer.raw.paymentCards.length <= 0) {
            return;
        }

        var curSavedPayments = customer.raw.paymentCards;
        var contactList = customer.get('contacts');
        for (var i in curSavedPayments) {
            curSavedPayments[i].cardNumber = curSavedPayments[i].cardNumberPart;
            curSavedPayments[i].isDefault = customer.raw.paymentCards[i].isDefaultPayMethod;

            var foundItem = contactList.find(function (element) {
                return (element.id === curSavedPayments[i].contactId);
            });

            curSavedPayments[i].billingContact = foundItem;
        }

        this.savedPayments = this.filterAndClearArrayDuplicates(curSavedPayments, true);
    },

    getBalance: function (balance) {
        var content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Available Balance',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(balance),
                        tag: 'h2'
                    }
                ],
                tag: 'span'
            };

        return Ext.widget({
            anchor: 0,
            autoEl: content,
            flex: 1,
            itemId: 'availableBalance',
            margin: '20 0 10 0',
            xtype: 'box'
        });
    },

    getLimit: function (limit) {
        var content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Credit Limit',
                        tag: 'p'
                    },
                    {
                        html: this.record.formatCurrency(limit),
                        tag: 'h2'
                    }
                ],
                tag: 'span'
            };

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'creditLimit',
            autoEl: content
        });
    },

    getTerms: function (terms) {
        var paymentTermsSelect = null,
            paymentTermsItem = terms[0],
            termsContent = [],
            content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Payment Terms',
                        tag: 'p'
                    },
                    {
                        html: paymentTermsItem.description,
                        name: paymentTermsItem.code,
                        tag: 'p'
                    }
                ],
                tag: 'span'
            };

        /**
         * If Net Terms is only one item, show it as a static string
         * Otherwise, show a select input with each option
         */
        if (terms.length > 1) {
            terms.forEach(function (term) {
                termsContent.push(term.description);
            });

            return Ext.widget({
                fieldLabel: 'Payment Terms',
                flex: 1,
                forceSelection: true,
                name: 'paymentTerms',
                store: termsContent,
                xtype: 'selectfield'
            });
        }

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'paymentTerms',
            autoEl: content
        });
    },

    getFields: function (fields) {
        var extraFields = [],
            childFields = [],
            fieldMargin = '0 0 0 0';

        /**
         * Iterate through extra fields, build array to display
         */
        fields.forEach(function (field) {
            if (field.isEnabled) {

                /**
                 * If the field is not the left-most field, add left padding
                 */
                if (childFields.length > 0) {
                    fieldMargin = '0 0 0 30';
                }

                var newField = {
                    allowBlank: !field.isRequired,
                    fieldLabel: field.label,
                    flex: 1,
                    margin: fieldMargin,
                    name: field.code,
                    xtype: 'textfield'
                };

                childFields.push(newField);

                if (childFields.length == 3) {
                    extraFields.push({
                        items: childFields,
                        layout: 'hbox',
                        xtype: 'fieldcontainer'
                    });
                    childFields = [];
                    fieldMargin = '0 0 0 0';
                }
            }
        });

        if (childFields.length) {
            extraFields.push({
                items: childFields,
                layout: 'hbox',
                xtype: 'fieldcontainer'
            });
        }

        return extraFields;
    },

    getPaymentPayload: function () {
        var me = this;
        var order = this.record;

        var billingInfo = null;
        var contactInfo = null;
        var amount = order.get('total');
        var curPayment = null;
        var paymentServiceCardId = null;
        var purchaseOrderInfo = null;

        billingInfo = {
            paymentWorkflow: 'Mozu',
            billingContact: {
                email: 'pBilling@test.com',
                firstName: 'PF1',
                lastNameOrSurname: 'PL1',
                phoneNumbers: {
                    home: '5128598745'
                },
                address: {
                    address1: 'Addr1',
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78758',
                    countryCode: 'US',
                    addressType: 'Residential'
                }
            }
        };

        purchaseOrderInfo = {
            purchaseOrderPayment: {
                customerPurchaseOrderAccountId: '11111111',
                purchaseOrderNumber: 'P#22222222',
                paymentTerm: {
                    code: '30-day',
                    description: '30 days'
                },
                customFields: [
                    {
                        code: 'Dep',
                        label: 'Department code:',
                        value: 'Marketing'
                    }
                ]
            }
        };

        contactInfo = {};

        return {
            actionName: 'CreatePayment',
            currencyCode: 'USD',
            amount: amount,
            paymentType: 'PurchaseOrder',
            billingInfo: billingInfo,
            purchaseOrderInfo: purchaseOrderInfo,
            orderId: order.getId()
        };
    },

    doSave: function () {
        var me = this;
        this.setLoading(true, this.body);

        var order = this.record;
        var payloadData = this.getPaymentPayload();

        order.addPayment({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return;
                }

                order.reload();
                me.saveSuccess(json);
            },
            failure: function (response) {
                me.setLoading(false, me.body);
                order.reload();

                // close the dialog
                me.close();
            }
        });
    }
});