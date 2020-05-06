/**
 * @class Taco.view.order.modal.AuditInfo
 */

Ext.define('Taco.view.order.modal.AuditLogInfo', {
    extend: 'Taco.core.ux.window.Modal',
    //requires: [],

    actionBar: {
        layout: {
            type: 'hbox',
            pack: 'end'
        }
    },

    actions: [
        {
            xtype: 'button',
            itemId: 'primaryAction',
            // this will tie this button to the validity of the form if one is assigned in the config. If the form is invalid, this action will be disabled.
            formBind: true
        }
    ],

    config: {
        dockedItems: null
    },

    primaryText: 'OK',

    closable: true,
    draggable: true,
    modal: true,
    resizable: false,

    isSave: false,
    closeOnSave: true,
    saveData: null,

    // The current order number.
    orderNumber: -1,

    // This must be a record and must be set so the data can be set properly.
    data: null,

    initComponent: function(eOpts) {
        var me = this;

        // Update the title to reflect the data
        me.setTitle(me.data.get('subject'));

        // Create the order object for the template below:
        var orderObject = { orderNumber: me.orderNumber };

        // Create the user object for the template below:
        var userObject = {appName: me.data.get('appName'), userName: me.data.get('userDisplayName')};

        // Set the items!
        var logHeader = Ext.create('Ext.container.Container', {
            width: '100%',
            layout: 'hbox',
            flex: 1,
            items: [
                {
                    flex: 1.5,
                    data: userObject,
                    tpl: [
                        '<tpl if="userName && userName.length &gt; 0"><div><b>User:</b> {userName:htmlEncode}</div></tpl>',
                        '<div><b>Application:</b> {appName}</div>'
                    ]
                }, {
                    flex: 0.5,
                    data: orderObject,
                    tpl: [
                        '<div><b>Order:</b> #{orderNumber}</div>'
                    ]
                }, {
                    flex: 1,
                    data: me.data.getData(),
                    tpl: [
                        '<div>{createDate:date("m/d/Y g:ia")}</div>'
                    ]
                }
            ]
        });

        var logDataContainer = me.createDataContainer(me.data.getData());

        me.items = [logHeader, logDataContainer];

        me.callParent(arguments);
    },

    createDataContainer: function (currentRecord) {
        var metaData = currentRecord.metadata;
        var dataContainer = null;

        if (Ext.Object.isEmpty(metaData)) {
            // Do something using message only!
            dataContainer = this.createDataUsingMessage(currentRecord);
        } else {
            dataContainer = this.createDataUsingMetadata(currentRecord);
        }

        return dataContainer;
    },

    doSave: function() {
        this.saveSuccess(null);
    },

    createDataUsingMessage: function(curRecord) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [{
                flex: 1,
                padding: '2 2',
                data: curRecord,
                tpl: [
                    '<div>{message:htmlEncode}</div>'
                ]
            }]
        });
    },

    createDataUsingMetadata: function (curRecord) {
        var dataContainer = null;
        var metaData = curRecord.metadata;

        if (metaData.length < 0) {
            return null;
        }

        switch (curRecord.subjectType) {
            case 'Line Items':
                {
                    // Currently not used!
                    dataContainer = this.createLineItemsInfo(metaData);
                    break;
                }
            case 'OrderItem':
                {
                    if (curRecord.subject.indexOf('Fulfillment') > -1) {
                        dataContainer = this.createFulfillmentChange(metaData);
                    } else if (curRecord.subject.indexOf('Product Price') > -1) {
                        dataContainer = this.createPriceChange(metaData);
                    } else if (curRecord.subject.indexOf('Product Quantity') > -1) {
                        dataContainer = this.createQuantityChange(metaData);
                    } else if (curRecord.subject.indexOf('Item Duty Amount Change') > -1) {
                        dataContainer = this.createDutyAmountChange(metaData);
                    } else {
                        dataContainer = this.createLineItemInfo(metaData);
                    }
                    break;
                }
            case 'Order Total':
                {
                    dataContainer = this.createOrderTotalInfo(metaData);
                    break;
                }
            case 'Payment':
            case 'StateChange.Payment':
                {
                    dataContainer = this.createPaymentInfo(metaData, curRecord.verb);
                    break;
                }
            case 'Order Shipping':
                {
                    dataContainer = this.createShippingInfo(metaData);
                    break;
                }
            case 'Coupon':
                {
                    dataContainer = this.createCouponInfo(metaData);
                    break;
                }
            case 'Items Shipped':
            case 'StateChange.Fulfillment':
                {
                    dataContainer = this.createItemsShippedInfo(metaData);
                    break;
                }
            case 'RMA':
            case 'StateChange.Return':
                {
                    if (curRecord.verb.toLowerCase() === 'created') {
                        dataContainer = this.createNestedGrid(metaData);
                    } else if (curRecord.verb.toLowerCase() === 'refunded') {
                        dataContainer = this.createRMARefundInfo(metaData);
                    } else if (curRecord.verb.toLowerCase() === 'applied') {
                        dataContainer = this.createReturnStateChange(curRecord);
                    }
                    break;
                }
            case 'Replacement Order':
                {
                    dataContainer = this.createNestedGrid(metaData);
                    break;
                }
            case 'Order Status':
            case 'StateChange.WorkflowAction':
            case 'Order':
                {
                    if (curRecord.subject.indexOf('Fulfillment Info Updated') > -1) {
                        dataContainer = this.createFulfillmentUpdate(metaData);
                        break;
                    }
                }
            case 'StateChange.Order':
                {
                    if (curRecord.subject.toLowerCase().indexOf('package updated') >= 0) {
                        dataContainer = this.createPackageMessage(metaData);
                    } else if (curRecord.subject.toLowerCase().indexOf('return') >= 0) {
                        dataContainer = this.createReturnMessage(curRecord);
                    } else if (curRecord.subject.toLowerCase().indexOf('refund') >= 0) {
                        dataContainer = this.createRefundMessage(metaData);
                    } else if (curRecord.subject.toLowerCase().indexOf('price list changed') >= 0) {
                        dataContainer = this.createPriceListChangedMessage(metaData);
                    } else if (curRecord.subject.toLowerCase().indexOf('paymentstatuschangefailed') >= 0) {
                        dataContainer = this.createPaymentStatusFailedMessage(curRecord);
                    } else {
                        dataContainer = this.createOrderMessage(curRecord);
                    }
                    break;
                }
            case 'Item':
            case 'WorkflowAction':
            case 'Cart':
                {
                    dataContainer = this.createDataUsingMessage(curRecord);
                    break;
                }
            default:
                {
                    // Do Nothing!
                    break;
                }
        }

        return dataContainer;
    },

    createFulfillmentUpdate: function (metaData) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [{
                flex: 1,
                padding: '2 2',
                data: metaData[0],
                tpl: [
                    '<div>Updated Fulfillment Info</div>',
                    '<br/>',
                    '<tpl if="updatedFulfillment.FulfillmentContact.Address">',
                    '<div>Update Address: <br/> {updatedFulfillment.FulfillmentContact.Address.Address1} {updatedFulfillment.FulfillmentContact.Address.Address2}</div>',
                    '<div>{updatedFulfillment.FulfillmentContact.Address.CityOrTown} {updatedFulfillment.FulfillmentContact.Address.StateOrProvince} {updatedFulfillment.FulfillmentContact.Address.PostalOrZipCode} {updatedFulfillment.FulfillmentContact.Address.CountryCode}</div>',
                    '</tpl>',
                    '<br/>',
                    '<tpl if="updatedFulfillment.ShippingMethodCode">',
                    '<div>Update Shipping Info: <br/> {updatedFulfillment.ShippingMethodCode} - {updatedFulfillment.ShippingMethodName}</div>',
                    '</tpl>'
                ]
            }]
        });
    },

    createQuantityChange: function(quantityData) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [
            {
                flex: 1,
                padding: '2 2',
                data: quantityData[0],
                tpl: [
                    '<div>Product Code: {productCode}</div>',
                    '<div>Product Name: {productName}</div>',
                    '<br/>',
                    '<div>Old Quantity: {oldValue}</div>',
                    '<div>New Quantity: {newValue}</div>'
                ]
            }]
        });
    },

    createDutyAmountChange: function(dutyData) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [
            {
                flex: 1,
                padding: '2 2',
                data: dutyData[0],
                tpl: [
                    '<div>Product Code: {productCode}</div>',
                    '<div>Product Name: {productName}</div>',
                    '<br/>',
                    '<div>Old Duty Amount: {[this.getCurrencyFormat(values.oldValue)]}</div>',
                    '<div>New Duty Amount: {[this.getCurrencyFormat(values.newValue)]}</div>',
                    {
                        getCurrencyFormat: function (v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            }]
        });
    },

    createPriceChange: function(priceData) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [
            {
                flex: 1,
                padding: '2 2',
                data: priceData[0],
                tpl: [
                    '<div>Product Code: {productCode}</div>',
                    '<div>Product Name: {productName}</div>',
                    '<br/>',
                    '<div>Old Amount: {[this.getCurrencyFormat(values.oldValue)]}</div>',
                    '<div>New Amount: {[this.getCurrencyFormat(values.newValue)]}</div>',
                    {
                        getCurrencyFormat: function (v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            }]
        });
    },

    createPackageMessage: function(packageData) {
        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [
            {
                flex: 1,
                padding: '2 2',
                data: packageData[0],
                tpl: [
                    '<div>Product Code: {productCode}</div>',
                    '<div>Product Name: {productName}</div>',
                    '<br/>',
                    '<div>Old Shipping Method: {oldValue}</div>',
                    '<div>New Shipping Method: {newValue}</div>'
                ]
            }]
        });
    },

    createPriceListChangedMessage: function (lineItemData) {
        var retVal = null;
        var itemsList = [];

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: lineItemData[0],
            tpl: [
                '<div>Old Price List Code: {[this.checkForEmptyString(values)]}</div>',
                {
                    checkForEmptyString: function(value) {
                        var oldCode = value.oldPriceListCode;
                        return !oldCode ? 'None' : oldCode;
                    }
                }
            ]
        });

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: lineItemData[0],
            tpl: [
                '<div>New Price List Code: {[this.checkForEmptyString(values)]}</div>',
                {
                    checkForEmptyString: function (value) {
                        var newCode = value.newPriceListCode;
                        return !newCode ? 'None' : newCode;
                    }
                }
            ]
        });

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
        return retVal;
    },

    createRefundMessage: function(refundData) {
        var itemsList = [];
        var refundMetaData = refundData[0];


        if (refundMetaData.transactionId != null && refundMetaData.transactionId.length > 0) {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: refundMetaData,
                tpl: [
                    '<div>Transaction Id: {refundTransactionId}</div>'
                ]
            });
        }


        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: refundMetaData,
            tpl: [
                '<div>Refund Type: {refundType}</div>'
            ]
        });

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: refundMetaData,
            tpl: [
                '<div>Refund Amount: {[this.getCurrencyFormat(values.refundAmount)]}</div>',
                {
                    getCurrencyFormat: function (v) {
                        var retVal,
                            isNegative;

                        v = v - 0;

                        if (v < 0) {
                            isNegative = true;
                            v = -v;
                        }
                        v = Taco.app.context.getCurrent().formatCurrency(v);


                        if (isNegative) {
                            retVal = '(' + v + ')';
                        } else {
                            retVal = v;
                        }

                        return retVal;
                    }
                }
            ]
        });



        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
    },

    createReturnMessage: function (retRecord) {
        var itemsList = [];
        var retData = retRecord.metadata[0];

        var verbHelper = 'to';
        if (retRecord.verb.toLowerCase() === 'updated') {
            verbHelper = 'on';
        } else if (retRecord.verb.toLowerCase() === 'removed') {
            verbHelper = 'from';
        }

        retData.verb = retRecord.verb;
        retData.verbHelper = verbHelper;

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: retData,
            tpl: [
                '<div>Return with Id {returnId} {verb} {verbHelper} order #{orderNumber}</div>'
            ]
        });

        if (retData.transactionId != null && retData.transactionId.length > 0) {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: retData,
                tpl: [
                    '<div>TransactionId: {transactionId}</div>'
                ]
            });
        }

        if (retRecord.verb.toLowerCase() !== 'added') {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: retData,
                tpl: [
                    '<div>Refund Amount: {[this.getCurrencyFormat(values.amount)]}</div>',
                    {
                        getCurrencyFormat: function(v) {
                            var retVal,
                                isNegative;
                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);

                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            });
        }

        var dataColumns = [];
        dataColumns.push({
            text: 'Product Code',
            dataIndex: 'field1',
            draggable: false,
            resizable: true,
            flex: 1,
            sortable: false,
            menuDisabled: true
        });

        var dataStore = Ext.StoreManager.lookup(retData.productCodes);

        var productGrid = Ext.create('Ext.grid.Panel', {
            header: false,
            editMode: false,
            enableCellEditing: false,
            padding: '20 0 0',
            columns: dataColumns,
            store: dataStore,
            height: '100%',
            width: '100%'
        });

        itemsList.push(productGrid);

        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
    },

    createPaymentStatusFailedMessage: function (orderRecordData) {
        var itemsList = [];
        var orderData = orderRecordData.metadata;

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: orderData[0],
            tpl: [
                '<div>Payment Status: {paymentStatus:htmlEncode}</div>',
                '<div>Amount: {[this.getCurrencyFormat(values.amount)]}</div>',
                '<div>Payment Action: {actionName:htmlEncode}</div>',
                '<div>Payment Id: {paymentId:htmlEncode}</div>',
                '<div>Correlation Id: {correlationId:htmlEncode}</div>',
                '<div>Details: {message:htmlEncode}</div>',
                {
                    getCurrencyFormat: function (v) {
                        if (v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                }
            ]
        });

        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
    },

    createOrderMessage: function (orderRecordData) {
        var itemsList = [];
        var orderData = orderRecordData.metadata;
        var statusLabel = 'Order Status';
        if (orderRecordData.subject != null && orderRecordData.subject.toLowerCase().indexOf('fulfillment') > -1) {
            statusLabel = orderRecordData.subject;
        } else if (orderRecordData.subject != null && orderRecordData.subject.toLowerCase().indexOf('payment') > -1) {
            statusLabel = 'Payment Status';
        }

        if (orderData[0].hasOwnProperty('amount')) {
            if (orderRecordData.subject.indexOf('Return') > -1) {
                itemsList.push({
                    flex: 1,
                    padding: '2 2',
                    data: orderRecordData,
                    tpl: [
                        '<div>{message:htmlEncode}</div>'
                    ]
                });
            }

            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: orderData[0],
                tpl: [
                    '<div>Amount: {[this.getCurrencyFormat(values.amount)]}</div>',
                    {
                        getCurrencyFormat: function(v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            });
        } else {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: orderData[0],
                // The value for a fulfillment change is an object. If we expand it to show the values within,
                // we should still do htmlEncode on user-provided values to prevent XSS attacks.
                tpl: [
                    '<div>'+ statusLabel +': {newValue:htmlEncode}</div>'
                ]
            });
        }

        return Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
    },

    createFulfillmentChange: function(fulfillmentData) {
        var retVal = null;

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: {
                flex: 1,
                padding: '2 2',
                data: fulfillmentData[0],
                tpl: [
                    '<div>Product Code: {productCode}</div>',
                    '<br>',
                    '<div>Fulfillment moved from: {oldLocation:htmlEncode}</div>',
                    '<div>Fulfillment moved to: {newLocation:htmlEncode}</div>',
                    '<div>Fulfillment method: {newMethod}</div>'
                ]
            }
        });
        return retVal;
    },

    createLineItemsInfo: function(lineItemData) {
        var retVal = null;
        var headerItems = { 'productCode': 'Product Code', 'quantity': 'Quantity', 'amount': 'Amount' };
        var dataColumns = [];
        var keyList = Object.keys(lineItemData[0]);

        for (var i = 0; i < keyList.length; ++i) {
            dataColumns.push({
                text: headerItems[keyList[i]],
                dataIndex: keyList[i],
                draggable: false,
                resizable: true,
                flex: 1,
                sortable: false,
                menuDisabled: true
            });
        }

        // TODO: make this amount show a currency.
        var dataStore = Ext.create('Ext.data.Store', {
            fields: keyList,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        dataStore.loadData(lineItemData);

        retVal = Ext.create('Ext.grid.Panel', {
            header: false,
            editMode: false,
            enableCellEditing: false,
            padding: '20 0 0',
            columns: dataColumns,
            store: dataStore,
            height: '100%',
            width: '100%'
        });
        return retVal;
    },

    createLineItemInfo: function (lineItemData) {
        var retVal = null;
        var itemsList = [];

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: lineItemData[0],
            tpl: [
                '<div>Product Code: {productCode}</div>'
            ]
        });

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: lineItemData[0],
            tpl: [
                '<div>Product Name: {productName}</div>'
            ]
        });

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: lineItemData[0],
            tpl: [
                '<div>Quantity: {quantity}</div>'
            ]
        });


        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });
        return retVal;
    },

    createOrderTotalInfo: function(orderTotalData) {
        var retVal = null;

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [{
                flex: 1,
                padding: '2 2',
                data: orderTotalData[0],
                tpl: [
                    '<div>Previous Total: {[this.getCurrencyFormat(values.oldValue)]}</div>',
                    '<div>Current Total: {[this.getCurrencyFormat(values.newValue)]}</div>',
                    {
                        getCurrencyFormat: function (v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            }]
        });

        return retVal;
    },

    createPaymentInfo: function(paymentData) {
        var retVal = null;
        var itemsList = [];

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: paymentData[0],
            tpl: [
                '<div>Transaction ID: {transactionId}</div>'
            ]
        });

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: paymentData[0],
            tpl: [
                '<div>Payment Type: {paymentType}</div>'
            ]
        }, {
            flex: 1,
            padding: '2 2',
            data: paymentData[0],
            tpl: [
                '<div>Amount: {[this.getCurrencyFormat(values)]}</div>',
                {
                    // This needs to take the newValue into effect.
                    getCurrencyFormat: function(v) {
                        var retVal,
                            isNegative,
                            amt;
                            
                        switch(v.newValue.toLowerCase()) {
                            case 'collected':
                            // FALL THROUGH: If we credit a payment, then we previously collected something against that payment.
                            case 'credited':
                            case 'creditpending':
                            {
                                amt = v.amountCollected;
                                break;
                            }
                            case 'new':
                            // FALL THROUGH ALL OF THESE
                            case 'pending':
                            case 'voided':
                            case 'declined':
                            case 'authorized':
                            {
                                amt = v.amountRequested;
                                break;
                            }
                            default:
                            {
                                // Serious data issue! Should not get here.
                                //  This handles display problems so NaN isn't displayed.
                                amt = 0;
                                break;
                            }
                        }

                        amt = amt - 0;

                        if (amt < 0) {
                            isNegative = true;
                            amt = -amt;
                        }
                        amt = Taco.app.context.getCurrent().formatCurrency(amt);


                        if (isNegative) {
                            retVal = '(' + amt + ')';
                        } else {
                            retVal = amt;
                        }

                        return retVal;
                    }
                }
            ]
        });



        if (paymentData[0].amountCredited > 0) {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: paymentData[0],
                tpl: [
                    '<div>Amount Credited: {[this.getCurrencyFormat(values)]}</div>',
                    {
                        // This needs to take the newValue into effect.
                        getCurrencyFormat: function (v) {
                            var retVal,
                                isNegative,
                                amt;

                            amt = v.amountCredited;

                            amt = amt - 0;

                            if (amt < 0) {
                                isNegative = true;
                                amt = -amt;
                            }
                            amt = Taco.app.context.getCurrent().formatCurrency(amt);


                            if (isNegative) {
                                retVal = '(' + amt + ')';
                            } else {
                                retVal = amt;
                            }

                            return retVal;
                        }
                    }
                ]
            });
        }

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: paymentData[0],
            tpl: [
                '<div>Payment Status: {newValue}</div>'
            ]
        });

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });

        return retVal;
    },

    createShippingInfo: function(shippingData) {
        var retVal = null;

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [{
                flex: 1,
                padding: '2 2',
                data: shippingData[0],
                tpl: [
                    '<div>Shipping Method: {shippingMethod}</div>',
                    '<div>Amount: {[this.getCurrencyFormat(values.value)]}</div>',
                    {
                        getCurrencyFormat: function (v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            }]
        });

        return retVal;
    },

    createCouponInfo: function(couponData) {
        var retVal = null;
        // Question, How do I make this Value field numerical or %?
        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: [{
                flex: 1,
                padding: '2 2',
                data: couponData[0],
                tpl: [
                    '<div>Coupon Code: {couponCode}</div>',
                    '<div>Status: {couponStatus}</div>',
                    '<div>Value: {value}</div>'
                ]
            }]
        });

        return retVal;
    },

    createItemsShippedInfo: function(shippedData) {
        var retVal = null;

        var dataStore = Ext.create('Ext.data.Store', {
            fields: ['productCode'],
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        dataStore.loadData(shippedData);

        retVal = Ext.create('Ext.grid.Panel', {
            header: false,
            editMode: false,
            enableCellEditing: false,
            padding: '20 0 0',
            columns: [
                {
                    text: 'Product Code',
                    dataIndex: 'productCode',
                    draggable: false,
                    resizable: true,
                    flex: 1,
                    sortable: false,
                    menuDisabled: true
                }
            ],
            store: dataStore,
            height: '100%',
            width: '100%'
        });

        return retVal;
    },

    createRMARefundInfo: function(rmaRefundData) {
        var retVal = null;

        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: {
                flex: 1,
                padding: '2 2',
                data: rmaRefundData[0],
                tpl: [
                    '<div>RMA ID: {rmaID}</div>',
                    '<div>Payment Transaction ID: {transactionId}</div>',
                    '<div>Amount: {[this.getCurrencyFormat(values.amount)]}</div>',
                    {
                        getCurrencyFormat: function(v) {
                            var retVal,
                                isNegative;

                            v = v - 0;

                            if (v < 0) {
                                isNegative = true;
                                v = -v;
                            }
                            v = Taco.app.context.getCurrent().formatCurrency(v);


                            if (isNegative) {
                                retVal = '(' + v + ')';
                            } else {
                                retVal = v;
                            }

                            return retVal;
                        }
                    }
                ]
            }
        });

        return retVal;
    },

    createReturnStateChange: function (retRecord) {
        var stateData = retRecord.metadata[0];
        var itemsList = [];

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: stateData,
            tpl: [
                '<div>{newValue} return with Id {returnNumber}</div>'
            ]
        });


        var dataColumns = [];
        dataColumns.push({
            text: 'Product Code',
            dataIndex: 'field1',
            draggable: false,
            resizable: true,
            flex: 1,
            sortable: false,
            menuDisabled: true
        });

        var dataStore = Ext.StoreManager.lookup(stateData.productCodes);

        var productGrid = Ext.create('Ext.grid.Panel', {
            header: false,
            editMode: false,
            enableCellEditing: false,
            padding: '20 0 0',
            columns: dataColumns,
            store: dataStore,
            height: '100%',
            width: '100%'
        });

        itemsList.push(productGrid);


        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            items: itemsList
        });

        return retVal;
    },

    createNestedGrid: function(nestedData) {
        var retVal = null;
        var headerItems = { 'rmaId': 'RMA ID', 'orderNumber': 'Order Number', 'productCode': 'Product Code', 'amount': 'Amount' };
        var keyList, dataColumns, containerItemList = [];

        for (var m = 0; m < nestedData.length; ++m) {
            dataColumns = [];
            keyList = Object.keys(nestedData[m].productCodes[0]);

            for (var i = 0; i < keyList.length; ++i) {
                dataColumns.push({
                    text: headerItems[keyList[i]],
                    dataIndex: keyList[i],
                    draggable: false,
                    resizable: true,
                    flex: 1,
                    sortable: false,
                    menuDisabled: true
                });
            }

            // TODO: make this amount show a currency.
            var dataStore = Ext.create('Ext.data.Store', {
                fields: keyList,
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        root: 'items'
                    }
                }
            });

            dataStore.loadData(nestedData[m].productCodes);

            var gridItem = Ext.create('Ext.grid.Panel', {
                header: false,
                editMode: false,
                enableCellEditing: false,
                padding: '20 0 0',
                columns: dataColumns,
                store: dataStore,
                width: '60%'
            });

            // Push the created data into this container list, to be displayed!
            containerItemList.push({
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align:'middle'
                },
                width: '100%',
                padding: '5 0 5 0',
                items: [
                    {
                        width: '30%',
                        padding: '2 2',
                        data: nestedData[m],
                        tpl: [
                            '<div>{[this.grabDisplayData(values)]}</div>',
                            {
                                grabDisplayData: function(values) {
                                    if (Object.keys(values).indexOf('orderNumber') > -1) {
                                        return '<div>Order Number: ' + values.orderNumber + '</div>';
                                    } else {
                                        return '<div>RMA ID: ' + values.rmaId + '</div>';
                                    }
                                }
                            }
                        ]
                    },
                    gridItem
                ]
            });
        }
        
        retVal = Ext.create('Ext.container.Container', {
            padding: '20 0 0',
            width: '100%',
            items: containerItemList
            });
        
        return retVal;
    }
});