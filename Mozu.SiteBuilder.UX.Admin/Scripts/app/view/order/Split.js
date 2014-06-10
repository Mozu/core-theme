/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Split', {
    extend: 'Taco.core.ux.form.SplitEditor',
    alias: 'widget.order.split',
    requires: [
        'Taco.model.Order',
        'Taco.view.order.Grid',
        'Taco.store.OrderGrid',
        'Taco.view.order.Form',
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.view.order.AdvancedSearchForm'
    ],

    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },
    
    statics: {
        eastConfigs: {
            placeholder: {
                xtype: 'component',
                html: 'hello world'
            }
            /*
            ,
            form: {
                xtype: 'taco-orderform' 
            }
            */
        }
    },

    title: "Orders",

    cls: "taco-content-navcontainer-padding",

    initComponent: function () {
        var actions;

        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderGrid');

        this.editor = {
            xtype: "panel",
            html: "test"
        }

        this.config.east = [this.editor];
        
        this.orderList = Ext.create('Taco.view.order.Grid', {
            // hides the header (the title)
            header: false,
            addContentViewPadding: false,
            // disables the navHeader Mixin;
            enableNavHeader: false,

            // this disables the default behavior in the LaunchEditor Mixin;
            launchEditorOnClick: false,
            listeners: {
                itemkeydown: {
                    scope: this,
                    fn: function (grid, record, item, index, e, eOpts) {                        
                        if (e.getKey() == Ext.EventObject.ENTER) {
                            this.handleSelectionChange(null, record)
                        }
                    }
                },
                itemclick: {
                    scope: this,
                    fn: function ( grid, record, item, index, e, eOpts) {
                        this.handleSelectionChange(null, record)                     
                    }
                },
                selectionchange:{
                    scope:this,
                    fn:function (){
                        console.log("selectionchange")

                    }
                },
                select: {
                    scope: this,
                    fn: function () {
                        console.log("select")
                    }
                },
                itemdblclick: {
                    scope: this,
                    fn: 'handleSelectionChange'
                }
            }
        });

        
        this.config.west = [this.orderList];
        


        //this.config.west = [{
        //    xtype: 'grid',
        //    stateful: true,
        //    stateId: 'statefulOrderGrid',
        //    store: this.store,
        //    listeners: {
        //        itemdblclick: {
        //            scope: this,
        //            fn: 'handleSelectionChange'
        //        }
        //    },
        //    columns: [{
        //        stateId: 'orderNumber',
        //        dataIndex: 'orderNumber',
        //        text: 'Order Number',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100
        //    }, {
        //        stateId: 'createDate',
        //        dataIndex: 'createDate',
        //        text: 'Order Date',
        //        flex: 1,
        //        minWidth: 180,
        //        xtype: 'datecolumn',
        //        format: 'M d Y g:ia'
        //    }, {
        //        stateId: 'firstName',
        //        dataIndex: 'billingContact',
        //        text: 'First Name',
        //        flex: 1,
        //        width: 120,
        //        sortable: false,
        //        getSortParam: function () {
        //            return 'billingContact.firstName';
        //        },
        //        renderer: function (value, metaData, record) {
        //            return Ext.util.Format.htmlEncode(value.firstName);
        //        }
        //    }, {
        //        stateId: 'lastName',
        //        dataIndex: 'billingContact',
        //        text: 'Last Name',
        //        flex: 1,
        //        minWidth: 120,
        //        width: 120,
        //        sortable: false,
        //        getSortParam: function () {
        //            return 'billingContact.lastName';
        //        },
        //        renderer: function (value, metaData, record) {
        //            return Ext.util.Format.htmlEncode(value.lastName);
        //        }
        //    }, {
        //        stateId: 'orderTotal',
        //        dataIndex: 'total',
        //        text: 'Order Total',
        //        renderer: 'usMoney',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100
        //    }, {
        //        stateId: 'orderStatus',
        //        dataIndex: 'orderStatus',
        //        text: 'Order Status',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100,
        //        sortable: false
        //    }, {
        //        stateId: 'paymentStatus',
        //        dataIndex: 'paymentStatus',
        //        text: 'Payment Status',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100
        //    }, {
        //        stateId: 'fulfillmentStatus',
        //        dataIndex: 'fulfillmentStatus',
        //        text: 'Fulfillment Status',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100,
        //        sortable: false
        //    }, {
        //        stateId: 'channelName',
        //        text: 'Channel',
        //        dataIndex:"channelName",
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100,
        //        sortable: false
        //    }, {
        //        stateId: 'customerEmail',
        //        text: 'Customer Email',
        //        dataIndex: 'billingContact',
        //        flex: 1,
        //        minWidth: 160,
        //        width: 260,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            return value && value.email ? value.email : null;
        //        }
        //    }, {
        //        stateId: 'customerState',
        //        text: 'Customer State',
        //        dataIndex: 'billingContact',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            return value && value.stateOrProvince ? value.stateOrProvince : null;
        //        }
        //    }, {
        //        stateId: 'paymentType',
        //        text: 'Payment Type',
        //        dataIndex: 'payments',
        //        flex: 1,
        //        minWidth: 120,
        //        width: 120,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            return Ext.isArray(value) ? Ext.Array.unique(Ext.Array.pluck(value, 'paymentType')).join(', ') : null;
        //        }
        //    }, {
        //        stateId: 'amountReceived',
        //        text: 'Amount Received',
        //        dataIndex: 'authorizationInfo',
        //        flex: 1,
        //        minWidth: 120,
        //        width: 120,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            return Ext.util.Format.usMoney(value.amountCollected);
        //        }
        //    }, {
        //        stateId: 'remainingAmount',
        //        text: 'Remaining Amount',
        //        dataIndex: 'authorizationInfo',
        //        flex: 1,
        //        minWidth: 120,
        //        width: 120,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            return Ext.util.Format.usMoney(value.captureAmount);
        //        }
        //    }, {
        //        stateId: 'ipAddress',
        //        text: 'IP Address',
        //        dataIndex: 'ipAddress',
        //        flex: 1,
        //        minWidth: 120,
        //        width: 120,
        //        sortable: false,
        //        hidden: true
        //    }, {
        //        stateId: 'fraudScore',
        //        text: 'Fraud Score',
        //        dataIndex: 'attributes',
        //        flex: 1,
        //        minWidth: 100,
        //        width: 100,
        //        sortable: false,
        //        hidden: true,
        //        renderer: function (value, metaData, record) {
        //            var attribute = Ext.Array.findBy(value, function (item, index) {
        //                return item.fullyQualifiedName === 'tenant~Kount Fraud Detection Results';
        //            }, this);
        //            var results = attribute ? attribute.values[0] : '';
        //            var start;

        //            if (attribute) {
        //                start = results.indexOf('FraudScore');
        //                results = Ext.String.splitWords(results.substr(start === -1 ? 0 : start))[1];
        //            }

        //            return results;
        //        }
        //    }, {
        //        stateId: 'actions',
        //        xtype: 'taco.menucolumn',
        //        text: 'Actions',
        //        menuItems: [
        //        {
        //            text: 'Edit',
        //            requiredBehaviors: {
        //                model: 'Taco.model.Category',
        //                behavior: 'update'
        //            },
        //            menuColumnHandler: function (item, eventData) {
        //                var page = eventData.grid.getParentPage(),
        //                    record = eventData.record,
        //                    metaData = { id: record.getId() };

        //                page.launchEditor(record, metaData);

        //            }
        //        }, 
        //            {
        //                text: 'Capture Payment',
        //                itemId: 'capturePaymentAction',
        //                menuColumnHandler: function (item, eventData) {
        //                    var me = this,
        //                        record = eventData.record,
                              
        //                        grid = eventData.grid,
        //                        index = eventData.rowIndex,
        //                        amount = record.get('total')  -   (((record.get('authorizationInfo')|| {}).amountCollected) || 0),
        //                        data = {
        //                            orderId: record.getId(),
        //                            paymentId: record.payments().getAt(0).getId(),
        //                            amount: amount
        //                        },
        //                        ajaxConfig = {
        //                            jsonData: data,
        //                            success: function (response) {
        //                                var json = Ext.decode(response.responseText, true);

        //                                if (!json || !json.success) {
        //                                    Taco.app.fireEvent('setmessage', 'issue capturing payment on order# <a href="#" onclick="Taco.core.StateManager.attemptNavigate(\'/admin/orders/edit/' + record.getId() + '\')">' + record.get('orderNumber') + '</a>', 'error');
        //                                }
                                       
        //                                record.reload();
        //                            },
        //                            failure: function () {
        //                                Taco.app.fireEvent('setmessage', 'issue capturing payment on order# <a href="#" onclick="Taco.core.StateManager.attemptNavigate(\'/admin/orders/edit/' + record.getId() + '\')">' + record.get('orderNumber') + '</a>', 'error');
        //                            },
        //                            scope: this
        //                        };

        //                    record.capturePayment(ajaxConfig);


        //                }
        //            }
        //        ,
        //        {
        //            text: 'Cancel Order',
        //            itemId: "cancelAction",
        //            menuColumnHandler: function (item, eventData) {
        //                var me = this,
        //                    record = eventData.record,
        //                    grid = eventData.grid,
        //                    index = eventData.rowIndex,
        //                    row = Ext.get(grid.getView().getNode(record));

        //                Ext.MessageBox.show({
        //                    title: 'Cancel Order',
        //                    // pushes the buttons to the right to be consistant with our dialog ux.
        //                    rightJustifyButtons: true,
        //                    // reverses the order of the buttons
        //                    reverseOrder: true,
        //                    msg: 'Are you sure you want to cancel this order?',
        //                    closable: false,
        //                    buttons: Ext.Msg.YESNO,
        //                    fn: function (rec) {
        //                        if (rec === 'yes') {
        //                            grid.setLoading(true);

        //                            record.cancelOrder({
        //                                jsonData: {
        //                                    orderId: record.get('id')
        //                                },
        //                                success: function (response) {
        //                                    grid.setLoading(false);
        //                                    var json = Ext.decode(response.responseText, true);
        //                                    if (!json || !json.success) {
        //                                        Taco.app.fireEvent('setmessage', "Error canceling order", 'error');
        //                                        return;
        //                                    }
        //                                    record.reload();
        //                                },
        //                                failure: function (response) {
        //                                    var json = Ext.decode(response.responseText, true),
        //                                        msg = (json && json.message) ? json.message : "Error canceling order";
        //                                    Taco.app.fireEvent('setmessage', msg, 'error');
        //                                    grid.setLoading(false);
        //                                }
        //                            });
        //                        }
        //                    }
        //                });
                        
        //            }
        //        }],

        //        // do any processing needed to show menu
        //        onMenuShow: function (menu, eventData) {

        //            var me = this,
        //                record = eventData.record,
        //                availableActions = record.get("availableActions"),
        //                canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
        //                cancelAction = menu.items.get('cancelAction'),
        //                capturePaymentAction = menu.items.get('capturePaymentAction'),
        //                canCapture = record.payments().getCount() == 1 && (record.payments().getAt(0).get('availableActions') || []).indexOf('CapturePayment') > -1;

        //            /*    Order only has a single payment transaction
        //            Order Payment transaction is in “Authorized State”*/

        //            cancelAction.setDisabled(!canCancel);
        //            capturePaymentAction.setDisabled(!canCapture);
        //        }
        //    }]
        //}];

        
        this.callParent(arguments);
        

        // forcing this thing to display open by default. to make working on this view easier;
        // todo: make this by config
        this.mon(this, 'boxready', function () {            
            this.setCollapsedState({
                west: false,
                east: false
            });
        },this)
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getWestTitle: function () {
        return this.orderList.getTitle();
    },

    // override of template method in splitEditor.js. Used to delegate the title to the views
    getEastTitle: function () {
        var title = (this.editor && this.editor.getTitle) ? this.editor.getTitle() : "Edit";
        return title;
    },
    

    canNavigateToNext:function() {
        var form = this.getEast().down('form');
        var rec = form ? this.store.getById(form.getForm().getRecord.getId()) : false;

        return rec && this.store.getTotalCount() > 1 && rec.index < this.store.getTotalCount();
    },

    canNavigateToPrevious: function () {
        var form = this.getEast().down('form');
        var rec = form ? this.store.getById(form.getForm().getRecord.getId()) : false;

        return rec && rec.index != 0;
    },

    changeRecord: function (nextRecord) {
        this.callParent(arguments);

        this.updateEast('form', { record: nextRecord });
    },

    navigateTo: function (forward) {
        var index = this.store.indexOfId(this.record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            outOfIndexMeth = forward ? 'nextPage' : 'previousPage',
            validCheck = forward ? 'canNavigateToNext' : 'canNavigateToPrevious',
            rec;

        if (!this[validCheck]()) return;

        if (index != -1) {
            this.setLoading();
            rec = this.store.data.getAt(navToIndex);
            if (rec) {
                Taco.core.StateManager.attemptNavigate('/orders/edit/' + rec.getId());
            } else {
                this.store[outOfIndexMeth]({
                    scope: this,
                    callback: function () {
                        this.setLoading(false);
                        navToIndex = forward ? 0: this.store.count() - 1;
                        rec = this.store.data.getAt(navToIndex);
                        if (rec) {
                            Taco.core.StateManager.attemptNavigate('/orders/edit/' + rec.getId());
                        }
                    }
                });
            }

        }
        
        

    },

    navigateToNext: function () {
        this.navigateTo(true);
    },

    navigateToPrevious: function () {
        this.navigateTo(false);
    },

    onModeChange: function (nextMode, prevMode) {
        var isView = (nextMode === 'view');
        //var actions = this.header.actionsContainer;
        var form = this.getEast().down('form');

        this.callParent(arguments);

        /*
        actions.items.each(function (item) {
            item.setVisible(item.getItemId() === 'create' ? isView : !isView);
        });
        */

        if (isView && !form) {
            this.updateEast('placeholder');
        }
    },

    onRecordChange: function () {
        //var actions = this.header.actionsContainer;

        this.callParent(arguments);
        /*
        actions.items.each(function (item) {
            var itemId = item.getItemId();

            if (itemId === 'previous') item.setDisabled(!this.canNavigateToPrevious);
            if (itemId === 'next') item.setDisabled(!this.canNavigateToNext);
        }, this);
        */

    },

    resetForm: function () {

        this.updateEast('placeholder');
    },

    updateEast: function (key, config) {
        var east = this.getEast();
        var defaults = this.statics().eastConfigs[key],
            url = "orders/split";

        east.removeAll(true);

        if (defaults) {
            config = Ext.apply({}, config || {}, defaults);
        }
        //uriOrState, metadata, useReplace
        if (config&& config.record) {
            url = "orders/edit/" + config.record.getId();
        }
        if (key == "form") {
            Taco.core.StateManager.attemptNavigate(url, { complexMetaData: { container: east } });
        } else {
            east.removeAll();
            east.add(config);
        }
       
       
    }
});
