/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.orderindex',
    requires: [
        'Taco.model.Order',
        'Taco.store.OrderGrid',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm'
    ],

    typeName: 'Order',
    modelName: 'Taco.model.Order',
    store: { type: 'Taco.store.OrderGrid' },
    editorName: 'Taco.view.order.Edit',
    
    //contextConfig: {
    //    supportedLevels: ['t','s'],
    //    requiresContextOfType: ['t', 'm', 'c', 's']
    //},



    //filterProperty: 'orderNumber',
    useTilePanel: false,
    //todo:  changing to s until orders support site id in resource
  
   

    gridPanelConf: {
        stateful: true,
        stateId: 'statefulOrderGrid',
        columns: [{
            stateId: 'orderNumber',
            dataIndex: 'orderNumber',
            text: 'Order Number',
            flex: 1,
            minWidth: 100,
            width: 100
        }, {
            stateId: 'createDate',
            dataIndex: 'createDate',
            text: 'Order Date',
            flex: 1,
            minWidth: 180,
            xtype: 'datecolumn',
            format: 'M d Y g:ia'
        }, {
            stateId: 'firstName',
            dataIndex: 'billingContact',
            text: 'First Name',
            flex: 1,
            width: 120,
            sortable: false,
            getSortParam: function () {
                return 'billingContact.firstName';
            },
            renderer: function (value, metaData, record) {
                return Ext.util.Format.htmlEncode(value.firstName);
            }
        }, {
            stateId: 'lastName',
            dataIndex: 'billingContact',
            text: 'Last Name',
            flex: 1,
            minWidth: 120,
            width: 120,
            sortable: false,
            getSortParam: function () {
                return 'billingContact.lastName';
            },
            renderer: function (value, metaData, record) {
                return Ext.util.Format.htmlEncode(value.lastName);
            }
        }, {
            stateId: 'orderTotal',
            dataIndex: 'total',
            text: 'Order Total',
            renderer: 'usMoney',
            flex: 1,
            minWidth: 100,
            width: 100
        }, {
            stateId: 'orderStatus',
            dataIndex: 'orderStatus',
            text: 'Order Status',
            flex: 1,
            minWidth: 100,
            width: 100,
            sortable: false
        }, {
            stateId: 'paymentStatus',
            dataIndex: 'paymentStatus',
            text: 'Payment Status',
            flex: 1,
            minWidth: 100,
            width: 100
        }, {
            stateId: 'fulfillmentStatus',
            dataIndex: 'fulfillmentStatus',
            text: 'Fulfillment Status',
            flex: 1,
            minWidth: 100,
            width: 100,
            sortable: false
        }, {
            stateId: 'orderType',
            text: 'Order Type',
            dataIndex: "orderType",
            flex: 1,
            minWidth: 100,
            width: 100,
            sortable: true
        }, {
            stateId: 'channelName',
            text: 'Channel',
            dataIndex: "channelName",
            flex: 1,
            minWidth: 100,
            width: 100,
            sortable: false
        }, {
            stateId: 'siteName',
            text: 'SiteName',
            dataIndex: "siteName",
            flex: 1,
            minWidth: 100,
            width: 100,
            hidden:true,
            sortable: false
        }, {
            stateId: 'customerEmail',
            text: 'Customer Email',
            dataIndex: 'billingContact',
            flex: 1,
            minWidth: 160,
            width: 260,
            sortable: false,
            hidden: true,
            renderer: function (value, metaData, record) {
                return value && value.email ? value.email : null;
            }
        }, {
            stateId: 'customerState',
            text: 'Customer State',
            dataIndex: 'billingContact',
            flex: 1,
            minWidth: 100,
            width: 100, 
            sortable: false,
            hidden: true,
            renderer: function (value, metaData, record) {
                return value && value.stateOrProvince ? value.stateOrProvince : null;
            }
        }, {
            stateId: 'paymentType',
            text: 'Payment Type',
            dataIndex: 'payments',
            flex: 1,
            minWidth: 120,
            width: 120,
            sortable: false,
            hidden: true,
            renderer: function (value, metaData, record) {
                return Ext.isArray(value) ? Ext.Array.unique(Ext.Array.pluck(value, 'paymentType')).join(', ') : null;
            }
        }, {
            stateId: 'amountReceived',
            text: 'Amount Received',
            dataIndex: 'authorizationInfo',
            flex: 1,
            minWidth: 120,
            width: 120,
            sortable: false,
            hidden: true,
            renderer: function (value, metaData, record) {
                return Ext.util.Format.usMoney(value.amountCollected);
            }
        }, {
            stateId: 'remainingAmount',
            text: 'Remaining Amount',
            dataIndex: 'authorizationInfo',
            flex: 1,
            minWidth: 120,
            width: 120,
            sortable: false,
            hidden: true,
            renderer: function (value, metaData, record) {
                return Ext.util.Format.usMoney(value.captureAmount);
            }
        }, {
            stateId: 'ipAddress',
            text: 'IP Address',
            dataIndex: 'ipAddress',
            flex: 1,
            minWidth: 120,
            width: 120,
            sortable: false,
            hidden: true
        }, {
            stateId: 'fraudScore',
            text: 'Fraud Score',
            dataIndex: 'fraudScore',
            itemId: 'fraudScore',
            flex: 1,
            minWidth: 100,
            width: 100,
            sortable: false,
            hidden: true
        }, {
            stateId: 'actions',
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [
            {
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.Order',
                    behavior: 'update'
                },
                menuColumnHandler: function (item, eventData) {
                    var page = eventData.grid.getParentPage(),
                        record = eventData.record,
                        metaData = { id: record.getId() };

                    page.launchEditor(record, metaData);

                }
            }, 
                {
                    text: 'Capture Payment',
                    itemId: 'capturePaymentAction',
                    menuColumnHandler: function (item, eventData) {
                        var me = this,
                            record = eventData.record,
                          
                            grid = eventData.grid,
                            index = eventData.rowIndex,
                            amount = record.get('total')  -   (((record.get('authorizationInfo')|| {}).amountCollected) || 0),
                            data = {
                                orderId: record.getId(),
                                paymentId: record.payments().getAt(0).getId(),
                                amount: amount
                            },
                            ajaxConfig,
                            errorMsg = 'issue capturing payment on order# <a href="#" onclick="Taco.core.StateManager.attemptNavigate(\'/admin/orders/edit/' + record.getId() + '\')">' + record.get('orderNumber') + '</a>';
                        
                        
                        ajaxConfig= {
                            jsonData: data,
                            errorMsg : errorMsg,
                            success: function (response) {                                
                                record.reload();
                            },
                            scope: this
                        };

                        record.capturePayment(ajaxConfig);
                    }
                }
            ,
            {
                text: 'Cancel Order',
                itemId: "cancelAction",
                menuColumnHandler: function (item, eventData) {
                    var me = this,
                        record = eventData.record,
                        grid = eventData.grid,
                        index = eventData.rowIndex,
                        row = Ext.get(grid.getView().getNode(record));
                    

                    /*
                    var mask  = new Ext.LoadMask({
                        msg: "Canceling Order...",
                        constrain: true,
                        target : row
                        //constrainTo:Ext.fly(row)
                    });
                    
                    */
                    

//                    row.unmask()
                    //mask.show();

                    

                    Ext.MessageBox.show({
                        title: 'Cancel Order',
                        // pushes the buttons to the right to be consistant with our dialog ux.
                        rightJustifyButtons: true,
                        // reverses the order of the buttons
                        reverseOrder: true,
                        msg: 'Are you sure you want to cancel this order?',
                        closable: false,
                        buttons: Ext.Msg.YESNO,
                        fn: function (rec) {
                            if (rec === 'yes') {
                                grid.setLoading(true);

                                record.cancelOrder({
                                    jsonData: {
                                        orderId: record.get('id')
                                    },
                                    success: function (response) {
                                        grid.setLoading(false);
                                        var json = Ext.decode(response.responseText, true);
                                        if (!json || !json.success) {
                                            Taco.app.fireEvent('setmessage', "Error canceling order", 'error');
                                            return;
                                        }
                                        record.reload();
                                    },
                                    failure: function (response) {
                                        var json = Ext.decode(response.responseText, true),
                                            msg = (json && json.message) ? json.message : "Error canceling order";
                                        Taco.app.fireEvent('setmessage', msg, 'error');
                                        grid.setLoading(false);
                                    }
                                });
                            }
                        }
                    });
                    
                }
            }],
            
            // do any processing needed to show menu
            onMenuShow: function (menu, eventData) {

                var me = this,
                    record = eventData.record,
                    availableActions = record.get("availableActions"),
                    canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
                    cancelAction = menu.items.get('cancelAction'),
                    capturePaymentAction = menu.items.get('capturePaymentAction'),
                    canCapture = record.payments().getCount() == 1 && (record.payments().getAt(0).get('availableActions') || []).indexOf('CapturePayment') > -1;

                /*    Order only has a single payment transaction
                Order Payment transaction is in “Authorized State”*/

                cancelAction.setDisabled(!canCancel);
                capturePaymentAction.setDisabled(!canCapture);
            }
        }]

    },


    launchLoadedEditor: function (record, options) {
        var currentSite = Taco.app.context.getSite(),
            oderSiteId = record.get('siteId'),
            infoStore,
            infoRecord;
         
        if (currentSite== null || oderSiteId != currentSite.id) {
            Taco.app.context.setCurrentSite(oderSiteId);
        }
        this.callParent(arguments);
    },
    
    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.order.AdvancedSearchForm',
        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{}, 'All Orders']
        ]
    }

});




///// <summary>
///// Current fulfillment status, which can be "NotFulfilled,", "PartiallyFulfilled", or "Fufilled."
/////             System-supplied and read-only.  Values are available in FulfillmentStatusConst of this class.
///// 
///// </summary>
//public string FulfillmentStatus { get; set; }



///// <summary>
///// Current status of payment, which can be "Null," "AwaitingCheck," "AwaitingPayment," "Paid," "Authorized," or "Void."
/////             System-supplied and read-only.
///// 
///// </summary>
//public string PaymentStatus { get; set; }


///// <summary>
///// Current status of the order, which can be viewed in OrderStatusConst. System-supplied and read-only.
///// 
///// </summary>
//public string Status { get; set; }
// public static class OrderStatusConst
//    {
//      public const string PENDING = "Pending";
//      public const string SUBMITTED = "Submitted";
//      public const string PROCESSING = "Processing";
//      public const string COMPLETED = "Completed";
//      public const string CANCELLED = "Cancelled";
//      public const string ABANDONED = "Abandoned";
//      public const string VALIDATED = "Validated";
//      public const string ACCEPTED = "Accepted";
//      public const string PENDING_REVIEW = "PendingReview";
//    }