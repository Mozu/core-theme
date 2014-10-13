/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.order.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.Category',
        'Taco.model.Order',
        'Taco.store.OrderGrid',
        'Taco.view.order.modal.ProductConfigurator'        
    ],

    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Order',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Order",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Orders",

    store: { type: 'Taco.store.Orders' },  

    autoScroll: true,

    enableQuickFilters:true,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.order.AdvancedSearchForm',
        
        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{}, 'All Orders']
        ]
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulOrderGrid',

    statics: {
        bulkActionResponses: {
            'AcceptOrder': '<ul class="message-list"><li class="message-item">{0} orders were accepted successfully.</li><li class="message-item">{1} orders were not accepted.{2}</li></ul>',
            'CancelOrder': '<ul class="message-list"><li class="message-item">{0} orders were cancelled successfully.</li><li class="message-item">{1} orders were not cancelled.{2}</li></ul>',
            'CapturePayment': '<ul class="message-list"><li class="message-item">{0} payments were captured successfully.</li><li class="message-item">{1} payments were not captured.{2}</li></ul>',
            'Ship': '<ul class="message-list"><li class="message-item">{0} packages were shipped successfully.</li><li class="message-item">{1} packages were not shipped.{2}</li></ul>'
        }
    },
        
    initComponent: function () {
        var me = this;
        
        // need to override the createButtonCfg;
        me.createButtonCfg = me.getCreateButtonConfig();

        this.columns = this.getColumnConfig();

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            ignoreRightMouseSelection: true,
            headerWidth: 37,
            listeners: {
                selectionchange: {
                    scope: this,
                    fn: function (selModel, selected) {
                        this.searchToolbar.items.get('bulkActions').setVisible(selected.length);
                    }
                }
            }
        });
        
        me.callParent(arguments);

        this.searchToolbar.insert(0, {
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            itemId: 'bulkActions',
            text: 'Bulk Actions',
            margin: '0 10 0 0',
            hidden: true,
            menu: {
                items: [{
                    itemId: 'AcceptOrder',
                    text: 'Accept',
                    scope: this,
                    handler: function () {
                        this.doBulkAction('AcceptOrder');
                    }
                }, {
                    itemId: 'CancelOrder',
                    text: 'Cancel',
                    scope: this,
                    handler: function () {
                        this.doBulkAction('CancelOrder');
                    }
                }, {
                    itemId: 'Ship',
                    text: 'Ship',
                    scope: this,
                    handler: function () {
                        this.doBulkAction('Ship');
                    }
                }, {
                    itemId: 'CapturePayment',
                    text: 'Capture',
                    scope: this,
                    handler: function () {
                        this.doBulkAction('CapturePayment');
                    }
                }],
                listeners: {
                    show: {
                        scope: this,
                        fn: 'getBulkActions'
                    }
                }
            }
        });
    },

    getBulkActions: function (menu) {
        var selection = this.getSelectionModel().getSelection();
        var context = Taco.app.context.getCurrent();
        var orders, config;

        orders = Ext.Array.map(selection, function (item) {
            var siteId = item.get('siteId');
            var mcId = context.masterCatalogId || getMasterCatalogId(context, siteId);

            return {
                orderId: item.get('id'),
                masterCatalogId: mcId
            };
        }, this);

        config = {
            url: '/admin/app/order/availableactions',
            method: 'POST',
            jsonData: {
                orderContexts: orders
            },
            callback: Ext.Function.bind(this.onGetBulkActions, this, [menu], 0)
        };

        menu.setLoading(true);
        Ext.Ajax.request(config);
    },

    onGetBulkActions: function (menu, operation, succeeded, response) {
        var parse = Ext.JSON.decode(response.responseText);

        if (menu && menu.rendered) {
            menu.items.each(function (item) {
                item.setDisabled(!succeeded || !Ext.Array.contains(parse.items, item.getItemId()));
            });

            menu.setLoading(false);
        }
    },
    
    doBulkAction: function (action) {
        var selection = this.getSelectionModel().getSelection();
        var context = Taco.app.context.getCurrent();
        var orders, config;

        // translate selected rows into objects with orderId and masterCatalogId
        orders = Ext.Array.map(selection, function (item) {
            var siteId = item.get('siteId');
            var mcId = context.masterCatalogId || getMasterCatalogId(context, siteId);

            return {
                orderId: item.get('id'),
                masterCatalogId: mcId
            };
        }, this);

        config = {
            url: '/admin/app/order/action',
            method: 'POST',
            jsonData: {
                actionName: action,
                orderContexts: orders
            },
            success: Ext.Function.bind(this.onBulkActionSuccess, this, [action, selection], 0)
        };

        Ext.Ajax.request(config);

        // if the current context is the tenant, find the master catalog that contains the given site
        function getMasterCatalogId (ctx, siteId) {
            var mc = Ext.Array.findBy(ctx.masterCatalogs, function (mc) {
                return Ext.Array.some(mc.sites, function (site) {
                    return site.id === siteId;
                });
            });

            return mc.id;
        }
    },

    onBulkActionSuccess: function (action, records, response) {
        var parse = Ext.JSON.decode(response.responseText);
        var messageType = parse.success ? 'success' : 'error';
        var summaryTpl = this.statics().bulkActionResponses[action];
        var failedItemsTpl = new Ext.XTemplate('<ul class="message-list"><tpl for="."><li class="message-item">Order #{orderNumber}</li></tpl></ul>');
        var failedItems = [];
        var message;

        // translate failed items into their corresponding records
        Ext.Array.each(parse.items, function (item) {
            if (!item.successful) failedItems.push(Ext.Array.findBy(records, function (record) {
                return record.get('id') === item.orderId;
            }));
        });

        // then sort by order number
        Ext.Array.sort(failedItems, function (a, b) {
            return a.get('orderNumber') - b.get('orderNumber');
        });

        message = Ext.String.format(summaryTpl, parse.items.length - failedItems.length, failedItems.length, failedItemsTpl.apply(Ext.Array.pluck(failedItems, 'data')));

        Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            scale: 'small',
            title: 'Bulk Actions',
            layout: 'fit',
            items: [{
                xtype: 'component',
                html: message
            }],
            actions: [{
                ui: 'action',
                itemId: 'primaryAction',
                text: 'Dismiss'
            }],
            doSave: function () { this.saveSuccess(); }
        });
    },

    launchLoadedEditor: function (record, options) {
        var currentSite = Taco.app.context.getSite(),
            oderSiteId = record.get('siteId'),
            infoStore,
            infoRecord;

        if (currentSite == null || oderSiteId != currentSite.id) {
            Taco.app.context.setCurrentSite(oderSiteId);
        }
        this.callParent(arguments);
    },


    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
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
                        return (value.firstName) ? Ext.util.Format.htmlEncode(value.firstName) : "N/A";
                        
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
                        return (value.firstName) ? Ext.util.Format.htmlEncode(value.lastName) : "N/A";
                    }
                }, {
                    stateId: 'orderTotal',
                    dataIndex: 'total',
                    text: 'Order Total',
                    renderer: function (value, metaData, record) {
                        return record.formatCurrency(value);
                    },
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
                    flex: 1,
                    minWidth: 100,
                    width: 100,
                    sortable: false,
                    renderer: function (value, metaData, record) {
                        return record.getChannelName();
                    }
                }, {
                    stateId: 'siteName',
                    text: 'SiteName',
                    dataIndex: "siteName",
                    flex: 1,
                    minWidth: 100,
                    width: 100,
                    hidden: true,
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
                        return record.formatCurrency(value.amountCollected);
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
                        return record.formatCurrency(value.captureAmount);
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
                }
            ];


        // add the actions column if required
        if (me.showActionsColumn) {
            columns.push(
                {
                    stateId: 'actions',
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

                                me.launchEditor(record, metaData);

                            }
                        }, {
                            text: 'Capture Payment',
                            itemId: 'capturePaymentAction',
                            menuColumnHandler: function (item, eventData) {
                                var me = this,
                                    record = eventData.record,
                                    payment = record.payments().getAt(0),

                                    grid = eventData.grid,
                                    index = eventData.rowIndex,
                                    amount = record.get('total') - (((record.get('authorizationInfo') || {}).amountCollected) || 0),
                                    data = {
                                        orderId: record.getId(),
                                        paymentId: payment.getId(),
                                        amount: amount
                                    },
                                    ajaxConfig,
                                    errorMsg = 'issue capturing payment on order# <a href="#" onclick="Taco.core.StateManager.attemptNavigate(\'/admin/orders/edit/' + record.getId() + '\')">' + record.get('orderNumber') + '</a>';


                                ajaxConfig = {
                                    jsonData: data,
                                    errorMsg: errorMsg,
                                    success: function (response) {
                                        record.reload();
                                    },
                                    scope: this
                                };

                                // prevent double capture attempts. they're really bad.
                                if (!payment.isCapturePending) {
                                    record.capturePayment(ajaxConfig);
                                }

                                payment.isCapturePending = true;
                                this.disable();
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
                        }
                    ],

                    // do any processing needed to show menu
                    onMenuShow: function (menu, eventData) {
                        var me = this,
                            record = eventData.record,
                            availableActions = record.get("availableActions"),
                            canCancel = Ext.Array.indexOf(availableActions, "CancelOrder") != -1,
                            cancelAction = menu.items.get('cancelAction'),
                            capturePaymentAction = menu.items.get('capturePaymentAction'),
                            hasExactlyOnePayment = record.payments().getCount() == 1,
                            recordPayment = hasExactlyOnePayment ? record.payments().getAt(0) : null,
                            paymentTypeCanBeCaptured = recordPayment && recordPayment.get('paymentType') !== 'Check', // checks require a 'check number' parameter to capture, so we can't capture from the grid.
                            canCapture = recordPayment && paymentTypeCanBeCaptured && !recordPayment.isCapturePending && (recordPayment.get('availableActions') || []).indexOf('CapturePayment') > -1;

                        // can capture if:
                        // order has exactly one payment
                        // payment is in "Authorized State" (has 'CapturePayment' as an available action)
                        // payment is not a check.

                        cancelAction.setDisabled(!canCancel);
                        capturePaymentAction.setDisabled(!canCapture);
                    }
                }

            )
        }

        return columns;
    },


    // if multi site, need to make the create button trigger a menu that lists out all of the possible sites;
    getCreateButtonConfig: function () {
        var me = this;
        
        // get site list
        var ctx = Taco.app.context,
            item,
            value,
            contextStore = Taco.app.context.getStore(false),
            menu = [],
            isMultiSite;

        // filter the context store to be only sites;
        contextStore.filter([
            {
                filterFn: function (item) {
                    return Ext.Array.contains(['s'], item.get("contextType"));
                },
                scope: this
            }
        ]);

        isMultiSite = (contextStore.count() > 1);

        // if multisite we need to make a menu button
        if (isMultiSite) {
            contextStore.each(function (record) {
                var itemConfig = {};
                itemConfig.siteId = record.raw.id; //Ext.clone(record.raw);
                itemConfig.text = record.raw.name;
                // remove the id from the data as it will cause conflicts between the duplicated items when they are configured;
                //delete itemConfig.id;
                menu.push(itemConfig);
            })
        }


        var createButtonConfig=  {
            xtype: 'button',
            text: me.createButtonText,
            margin: "0 0 0 10",
            ui: 'action-primary',
            scale: 'medium',
            hidden: !me.createButtonVisible,
            itemId: 'createActionButton',
            handler: me.createActionHandler,
            scope: me
        }

        // need to make create a menu button with list of sites;
        if (isMultiSite) {
            Ext.apply(createButtonConfig, {
                //remove the handler since it will be handled by the menu;
                handler: Ext.emptyFn,
                menu: {
                    plain: true,
                    showSeparator: false,
                    listeners: {
                        click: {
                            fn: function (menu, menuItem, e) {                                
                                if (!menuItem) {
                                    return
                                }
                                //var context= menuItem.context;
                                var siteId = menuItem.siteId;
                                // set the context to the siteId of the selected store;
                                var context = Taco.app.context.getStore().findRecord('id', siteId).raw
                                Taco.app.context.setCurrentContext(context);
                                //create the 
                                me.createActionHandler()

                            },
                            scope: me,
                            delegate: "x-menu-item-link"
                        }
                    },
                    items: menu
                }
            });
        }

        return createButtonConfig
    },

    doCreate: function () {
        var me = this;
        
        var ctx = Taco.app.context.getCurrentContext(),
            record;

        if (ctx.contextType !== 's') {
            Taco.app.context.setCurrentContext(Taco.app.context.getStore().findRecord('contextType', 's').raw);
            return;
        }

        Taco.app.setLoading();
        

        

        record = Ext.create('Taco.model.Order');

        record.save({
            callback: function (records, operation, success) {

                if (!success) {
                    Taco.app.fireEvent('setmessage', "Error creating order", 'error');
                    Taco.app.setLoading(false);
                    return;
                }

                //changing the path to be edit instead of create so that the user can refresh the page and get back to it if they accidently navigate away;
                Taco.core.StateManager.attemptNavigate('s-' + record.data.siteId + '/orders/edit/' + record.data.id);

                /*
                this.createContentView(this.getEditorView(), {
                    record: record
                });
                Taco.app.setLoading(false);
                */
            },
            scope: this
        });

    }

});