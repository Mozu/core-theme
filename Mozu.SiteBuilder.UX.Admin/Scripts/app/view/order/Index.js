/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.orderindex',
    requires: [
        'Taco.model.Order',
        'Taco.store.Orders',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm'
    ],

    typeName: 'Order',
    modelName: 'Taco.model.Order',
    store: { type: 'Taco.store.Orders' },
    editorName: 'Taco.view.order.Edit',
    
    //contextConfig: {
    //    supportedLevels: ['t','s'],
    //    requiresContextOfType: ['t', 'm', 'c', 's']
    //},



    //filterProperty: 'orderNumber',
    useTilePanel: false,
    //todo:  changing to s until orders support site id in resource
  
   

    gridPanelConf: {
        columns: [{
            dataIndex: 'orderNumber',
            text: 'Order Number',
            flex: 1,
            width: 100
        }, {
            dataIndex: 'createDate',
            text: 'Order Date',
            flex: 1,
            minWidth: 180,
            xtype: 'datecolumn',
            format: 'M d Y g:ia'
            //resizable: false,
           
        }, {
            dataIndex: 'billingContact',
            text: 'First Name',
            flex: 1,
            width: 120,
            getSortParam: function () {
                return 'billingContact.firstName';
            },
            renderer: function (value, metaData, record) {
                return value.firstName;
            }
        }, {
            dataIndex: 'billingContact',
            text: 'Last Name',
            flex: 1,
            width: 120,
            getSortParam: function () {
                return 'billingContact.lastName';
            },
            renderer: function (value, metaData, record) {
                return value.lastName;
            }
        }, {
            dataIndex: 'total',
            text: 'Order Total',
            renderer: 'usMoney',
            flex: 1,
            width: 100
        }, {
            dataIndex: 'orderStatus',
            text: 'Order Status',
            flex: 1,
            width: 100
        }, {
            dataIndex: 'paymentStatus',
            text: 'Payment Status',
            flex: 1,
            width: 120
        }, {
            dataIndex: 'fulfillmentStatus',
            text: 'Fulfillment Status',
            flex: 1,
            width: 120
        }, {
            text: 'Channel',
            dataIndex:"channelName",
            flex: 1,
            width: 100
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [
            {
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.Category',
                    behavior: 'update'
                },
                menuColumnHandler: function (item, eventData) {
                    var page = eventData.grid.getParentPage(),
                        record = eventData.record,
                        metaData = { id: record.getId() };

                    page.launchEditor(record, metaData);

                }
            }, {
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
                    cancelAction = menu.items.get('cancelAction');

                cancelAction.setDisabled(!canCancel);
            }
        }]

    },


    launchLoadedEditor: function (record, options) {
        var site = Taco.app.context.getSite(),
            infoStore,
            infoRecord;

        this.callParent(arguments);
    },
    
    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.order.AdvancedSearchForm'
    }
    
});