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
            balance = me.getBalance(me.record.get('customer').purchaseOrderAccount.availableBalance),
            limit = me.getLimit(me.record.get('customer').purchaseOrderAccount.creditLimit),
            terms = me.record.customer.raw.purchaseOrderAccount.customerPurchaseOrderPaymentTerms
                    ? me.getTerms(me.record.customer.raw.purchaseOrderAccount.customerPurchaseOrderPaymentTerms)
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
                            itemId: 'purchaseOrderNumber',
                            name: 'purchaseOrderNumber',
                            xtype: 'textfield'
                        },
                        {
                            allowBlank: false,
                            currencyCode: me.record.getCurrencyCode(),
                            fieldLabel: 'Amount',
                            flex: 1,
                            itemId: 'amount',
                            margin: '0 0 0 30',
                            name: 'amount',
                            value: me.getDefaultPaymentAmount(),
                            xtype: 'currencyfield'
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

    getDefaultPaymentAmount: function () {
        var me = this,
            retVal = "",
            authInfo;

        if (!this.defaultPaymentAmount) {
            retVal = this.record.getNewPaymentAmountHint();
        } else {
            retVal = this.defaultPaymentAmount;
        }

        retVal = (retVal < 0) ? "" : retVal;
        return retVal;
    },

    getAddress: function (billingAddress) {
        return {
            paymentWorkflow: 'Mozu',
            billingContact: {
                email: billingAddress.email,
                firstName: billingAddress.firstName,
                lastNameOrSurname: billingAddress.lastName,
                phoneNumbers: {
                    home: billingAddress.homePhone
                },
                address: {
                    address1: billingAddress.address1,
                    address2: billingAddress.address2,
                    address3: billingAddress.address3,
                    address4: billingAddress.address4,
                    cityOrTown: billingAddress.cityOrTown,
                    stateOrProvince: billingAddress.stateOrProvince,
                    postalOrZipCode: billingAddress.postalOrZipCode,
                    countryCode: billingAddress.countryCode,
                    addressType: billingAddress.addressType
                }
            }
        };
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
        var me = this,
            paymentTermsSelect = null,
            description,
            paymentTermsItem = terms[0],
            termsContent = [];

        if (!terms.isArray) {
            me.record.checkoutSettings.get('purchaseOrder').paymentTerms.forEach(function (desc) {
                if (desc.code == paymentTermsItem.code) {
                    paymentTermsItem.description = desc.description;
                }
            });
        }

        var content = {
                cls: 'taco-static-text',
                children: [
                    {
                        html: 'Payment Terms',
                        tag: 'p'
                    },
                    {
                        html: paymentTermsItem.description,
                        tag: 'h2'
                    },
                    {
                        xtype: 'hiddenfield',
                        name: 'paymentTerms',
                        value: paymentTermsItem.code
                    }
                ],
                tag: 'span',
                value: paymentTermsItem.code
            };

        /**
         * If Net Terms is only one item, show it as a static string
         * Otherwise, show a select input with each option
         */
        if (terms.length > 1) {
            terms.forEach(function (term) {
                me.record.checkoutSettings.get('purchaseOrder').paymentTerms.forEach(function (desc) {
                    if (desc.code == term.code) {
                        term.description = desc.description;
                        termsContent.push([term.description, term.code]);
                    }
                });
            });

            return Ext.create('Ext.form.field.ComboBox', {
                fieldLabel: 'Payment Terms',
                allowBlank: false,
                itemId: 'paymentTerms',
                name: 'paymentTerms',
                store: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data: termsContent
                })
            });
        }

        return Ext.widget({
            flex: 1,
            xtype: 'box',
            anchor: 0,
            margin: '20 0 10 0',
            itemId: 'paymentTerms',
            value: paymentTermsItem.code,
            autoEl: content,
            text: paymentTermsItem.description
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
                    itemId: 'custom-field-' + field.code,
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

    getPaymentPayload: function (fields) {
        var me = this;
        var order = this.record;

        var billingInfo = this.getAddress(this.record.get('billingContact'));
        var contactInfo = null;
        var amount = Ext.util.Format.htmlEncode(this.down('#amount').value);
        var curPayment = null;
        var paymentServiceCardId = null;
        var purchaseOrderInfo = null;
        var purchaseOrderNumber = Ext.util.Format.htmlEncode(this.down('#purchaseOrderNumber').value);
        var paymentTermsCode = this.down('#paymentTerms').valueModels
            ? Ext.util.Format.htmlEncode(this.down('#paymentTerms').valueModels[0].get('value'))
            : Ext.util.Format.htmlEncode(this.down('#paymentTerms').value);
        var paymentTermsDescription = this.down('#paymentTerms').valueModels
            ? Ext.util.Format.htmlEncode(this.down('#paymentTerms').valueModels[0].get('text'))
            : Ext.util.Format.htmlEncode(this.down('#paymentTerms').text);
        var customFields = [];
        var fieldId = null;
        var fieldData = null;
        var fieldObj = null;

        fields.forEach(function (field) {
            if (field.isEnabled) {
                fieldId = '#custom-field-' + field.code;
                fieldData = me.down(fieldId);
                fieldObj = {
                    code: field.code,
                    label: fieldData.fieldLabel,
                    value: Ext.util.Format.htmlEncode(fieldData.value)
                };

                customFields.push(fieldObj);
            }
        });

        purchaseOrderInfo = {
            purchaseOrderNumber: purchaseOrderNumber,
            paymentTerm: {
                code: paymentTermsCode,
                description: paymentTermsDescription
            },
            customFields: customFields
        };

        contactInfo = {
            email: billingInfo.billingContact.email,
            firstName: billingInfo.billingContact.firstName,
            lastName: billingInfo.billingContact.lastNameOrSurname,
            address1: billingInfo.billingContact.address.address1,
            address2: billingInfo.billingContact.address.address2,
            address3: billingInfo.billingContact.address.address3,
            address4: billingInfo.billingContact.address.address4,
            cityOrTown: billingInfo.billingContact.address.cityOrTown,
            countryCode: billingInfo.billingContact.address.countryCode,
            postalOrZipCode: billingInfo.billingContact.address.postalOrZipCode,
            stateOrProvince: billingInfo.billingContact.address.stateOrProvince,
            homePhone: billingInfo.billingContact.phoneNumbers.home
        };

        return {
            actionName: 'CreatePayment',
            currencyCode: 'USD',
            amount: amount,
            paymentType: 'PurchaseOrder',
            billingInfo: billingInfo,
            billingContact: contactInfo,
            purchaseOrderInfo: purchaseOrderInfo,
            orderId: order.getId()
        };
    },

    doSave: function () {
        var me = this;
        this.setLoading(true, this.body);

        var order = this.record;
        var payloadData = this.getPaymentPayload(me.record.checkoutSettings.get('purchaseOrder').customFields);

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