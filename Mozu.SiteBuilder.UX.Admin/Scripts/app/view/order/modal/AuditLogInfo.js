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
                        '<tpl if="userName && userName.length &gt; 0"><div><b>User:</b> {userName}</div></tpl>',
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
                    '<div>{message}</div>'
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
            case 'StateChange.Order':
                {
                    dataContainer = this.createOrderMessage(curRecord);
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

    createOrderMessage: function (orderRecordData) {
        var itemsList = [];
        var orderData = orderRecordData.metadata;

        if (orderData[0].hasOwnProperty('amount')) {
            if (orderRecordData.subject.indexOf('Return') > -1) {
                itemsList.push({
                    flex: 1,
                    padding: '2 2',
                    data: orderRecordData,
                    tpl: [
                        '<div>{message}</div>'
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
                tpl: [
                    '<div>Order Status: {newValue}</div>'
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
                    '<div>Fulfillment moved from: {oldLocation}</div>',
                    '<div>Fulfillment moved to: {newLocation}</div>',
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
        });

        itemsList.push({
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
                                amt = v.amountCredited;
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