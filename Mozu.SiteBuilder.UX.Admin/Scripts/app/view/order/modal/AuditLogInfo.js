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

        var orderObject = { orderNumber: me.orderNumber };
        // Set the items!
        var logHeader = Ext.create('Ext.container.Container', {
            width: '100%',
            layout: 'hbox',
            align: 'bottom',
            flex: 1,
            items: [
                {
                    flex: 1,
                    data: me.data.getData(),
                    tpl: [
                        '<div>User: {userDisplayName}</div>'
                    ]
                }, {
                    flex: 1,
                    data: orderObject,
                    tpl: [
                        '<div>Order: #{orderNumber}</div>'
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

    createDataContainer: function(currentRecord) {
        var recordData = currentRecord.data;
        var dataContainer = null;

        if (recordData.length < 0) {
            return null;
        } else if (Ext.Object.isEmpty(recordData[0])) {
            return null;
        }

        switch (currentRecord.subjectType) {
            case 'Line Items':
            {
                dataContainer = this.createLineItemInfo(recordData);
                break;
            }
            case 'Order Total':
            {
                dataContainer = this.createOrderTotalInfo(recordData);
                break;
            }
            case 'Payment':
            {
                dataContainer = this.createPaymentInfo(recordData, currentRecord.verb);
                break;
            }
            case 'Order Shipping':
            {
                dataContainer = this.createShippingInfo(recordData);
                break;
            }
            case 'Coupon':
            {
                dataContainer = this.createCouponInfo(recordData);
                break;
            }
            case 'Items Shipped':
            {
                dataContainer = this.createItemsShippedInfo(recordData);
                break;
            }
            case 'RMA':
            {
                if (currentRecord.verb.toLowerCase() === 'created') {
                    dataContainer = this.createNestedGrid(recordData);
                } else if (currentRecord.verb.toLowerCase() === 'refunded') {
                    dataContainer = this.createRMARefundInfo(recordData);
                }
                break;
            }
            case 'Replacement Order':
            {
                dataContainer = this.createNestedGrid(recordData);
                break;
            }
            case 'Order Status':
            {
                dataContainer = Ext.create('Ext.container.Container', {
                    padding: '20 0 0',
                    items: [
                        {
                            flex: 1,
                            padding: '2 2',
                            data: recordData[0],
                            tpl: [
                                '<div>New Status: {newValue}</div>'
                            ]
                        }
                    ]
                });
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

    doSave: function() {
        this.saveSuccess(null);
    },

    createLineItemInfo: function(lineItemData) {
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

    createPaymentInfo: function(paymentData, verb) {
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

        if (verb === 'Created') {
            itemsList.push({
                flex: 1,
                padding: '2 2',
                data: paymentData[0],
                tpl: [
                    '<div>Payment Type: {paymentType}</div>'
                ]
            });
        }

        itemsList.push({
            flex: 1,
            padding: '2 2',
            data: paymentData[0],
            tpl: [
                '<div>Amount: {[this.getCurrencyFormat(values.amount)]}</div>',
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