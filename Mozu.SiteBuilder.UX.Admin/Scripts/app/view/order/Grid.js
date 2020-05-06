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
        'Taco.view.order.modal.BulkActionMessage'
    ],

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Order',

    enableNavHeader: true,


    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    enableBulkActions: true,
    createButtonText: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.create_new_order,

    showActionsColumn: true,

    hideSearchToolbar: false,

    title: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.orders,

    autoScroll: true,

    itemId: 'taco-order-grid',

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.order.AdvancedSearchForm',

        quickFilterData: [
            [{ orderStatus: 'Open' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.open_orders],
            [{ paymentStatus: 'Unpaid,Pending', orderStatus: 'Open' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.unpaid_orders],
            [{ paymentStatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.paid],
            [{ orderStatus: 'Pending', orderType: 'Online' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.pending_online_orders],
            [{ orderStatus: 'Pending', orderType: 'Offline' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.pending_offline_orders],
            [{ fulfillmentStatus: 'Fulfilled' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.fulfilled_orders],
            [{ returnStatus: 'InProgress' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.returns_in_progress],
            [{ orderStatus: 'Cancelled' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.cancelled_orders],
            [{ orderStatus: 'Errored' }, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.errored_orders],
            [{}, Localizer.langResources.ORDERS.Orders.AdvancedFilter.QuickFilterData.all_orders]
        ],

        emptySearchText: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.search
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulOrderGrid',
    orderUpdateBehaviors: [{
        model: 'Taco.model.Order',
        behavior: 'update'
    },
    {
        model: 'Taco.model.Order',
        behavior: 'updateItem'
    },
    {
        model: 'Taco.model.Order',
        behavior: 'updatePrice'
    },
    {
        model: 'Taco.model.Order',
        behavior: 'updateDiscount'
    },
    {
        model: 'Taco.model.Order',
        behavior: 'updateAttribute'
    },
    {
        model: 'Taco.model.Order',
        behavior: 'manualAdjustment'
    }

    ],

    statics: {
        bulkActionResponses: {
            'AcceptOrder': '{0} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.of + ' {1} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.accept_message,
            'CancelOrder': '{0} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.of + ' {1} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.cancel_message,
            'CapturePayment': '{0} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.of + ' {1} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.capture_message,
            'Ship': '{0} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.of + ' {1} ' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.ship_message
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
            headerWidth: 37
        });

        //todo: need to work on disabling/enabling of actions -- talk with commerce peeps?

        this.bulkActionConfig = {
            onMenuShow: this.getBulkActions,
            onMenuHide: function () {
                Ext.Array.each(['#AcceptOrder', '#CancelOrder', '#CapturePayment', '#Ship'], function (id) {
                    this.down(id).disable();
                }, this);
            },
            actions: [
                {
                    itemId: 'AcceptOrder',
                    text: Localizer.langResources.ORDERS.Orders.OrderDetails.BulkActionButton.accept,
                    disabled: true,
                    scope: this,
                    requiredBehaviors: this.orderUpdateBehaviors,
                    handler: function () {
                        this.doBulkAction('AcceptOrder');
                    }
                },
                {
                    itemId: 'CancelOrder',
                    text: Localizer.langResources.ORDERS.Orders.OrderDetails.BulkActionButton.cancel,
                    disabled: true,
                    scope: this,
                    requiredBehaviors: this.orderUpdateBehaviors,
                    handler: function () {
                        this.doBulkAction('CancelOrder');
                    }
                },
                {
                    itemId: 'CapturePayment',
                    text: Localizer.langResources.ORDERS.Orders.OrderDetails.BulkActionButton.capture,
                    disabled: true,
                    scope: this,
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                    {
                        model: 'Taco.model.Order',
                        behavior: 'paymentUpdate'
                    }],
                    handler: function () {
                        this.doBulkAction('CapturePayment');
                    }
                },
                {
                    itemId: 'Ship',
                    text: Localizer.langResources.ORDERS.Orders.OrderDetails.BulkActionButton.ship,
                    disabled: true,
                    scope: this,
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'update'
                    },
                    {
                        model: 'Taco.model.Order',
                        behavior: 'fulfill'
                    }],
                    handler: function () {
                        this.doBulkAction('Ship');
                    }
                }

            ]
        };

        me.ajaxBeforeListener = Ext.Ajax.on('beforerequest', function (conn, options) {

            var dataViewModeHeader = {
                'x-vol-dataview-mode': 'Live'
            };

            if (options && options.headers) {
                Ext.apply(options.headers, dataViewModeHeader);
            }
        }, me, { destroyable: true });

        me.callParent(arguments);

    },

    onMenuHide: function () {
        alert('ho');
    },

    getBulkActions: function (selmodel) {
        var me = this;
        var selection = selmodel.getSelection();
        var allAvailableBulkActions = Ext.Array.flatten(Ext.Array.map(selection, function (o) { return o.get('availableBulkActions') }));

        Ext.Array.each(allAvailableBulkActions, function (itemId) {
            me.down('#' + itemId).enable();
        }, me);
    },

    doBulkAction: function (action) {
        var selection = this.getSelectionModel().getSelection();
        var context = Taco.app.context.getCurrent();
        var orders, config;

        // translate selected rows into objects with orderId and masterCatalogId
        orders = Ext.Array.map(selection, function (item) {
            var siteId = item.get('siteId');
            var mcId = context.masterCatalogId || this.getMasterCatalogId(context, siteId);

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
    },

    getMasterCatalogId: function (ctx, siteId) {
        var masterCatalog = Ext.Array.findBy(ctx.masterCatalogs, function (mc) {
            return Ext.Array.some(mc.sites, function (site) {
                return site.id === siteId;
            });
        });

        return masterCatalog.id;
    },

    onBulkActionSuccess: function (action, records, response) {
        var parse = Ext.JSON.decode(response.responseText);
        var messageType = parse.success ? 'success' : 'error';
        var summaryTpl = this.statics().bulkActionResponses[action];
        var successCount = 0;
        var items, message, isSuccess;

        items = Ext.Array.map(parse.items, function (item) {
            var record = Ext.Array.findBy(records, function (record) {
                return record.get('id') === item.orderId;
            });

            if (item.successful) successCount++;

            return Ext.apply({}, { orderNumber: record.get('orderNumber') }, item);
        });

        items = Ext.Array.sort(items, function (a, b) {
            return b.orderNumber - a.orderNumber;
        });

        message = Ext.String.format(summaryTpl, successCount, items.length);
        isSuccess = successCount === items.length;

        this.getView().refresh();

        Ext.create('Taco.view.order.modal.BulkActionMessage', {
            success: isSuccess,
            message: message,
            orders: items
        });
    },

    launchLoadedEditor: function (record, options) {
        var currentSite = Taco.app.context.getSite(),
            orderSiteId = record.get('siteId'),
            infoStore,
            infoRecord;

        if (currentSite == null || orderSiteId != currentSite.id) {
            Taco.app.context.setCurrentSite(orderSiteId);
        }
        this.callParent(arguments);
    },


    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        var customers = Taco.core.data.StoreManager.getOrCreate('Taco.store.Customers');

        var columns = [
            {
                stateId: 'orderNumber',
                dataIndex: 'orderNumber',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.order_number,
                flex: 1,
                minWidth: 100,
                width: 100
            },
            {
                stateId: 'externalId',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.external_order_id,
                dataIndex: 'externalId',
                itemId: 'externalId',
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: true,
                hidden: true
            },
            {
                stateId: 'parentCheckoutNumber',
                dataIndex: 'parentCheckoutNumber',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.order_reference_number,
                flex: 1,
                minWidth: 100,
                width: 100,
                hidden: true
            },
            {
                stateId: 'submittedDate',
                dataIndex: 'submittedDate',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.submitted_date,
                flex: 1,
                minWidth: 180,
                xtype: 'datecolumn',
                format: 'M d Y g:ia'
            }, {
                stateId: 'createDate',
                dataIndex: 'createDate',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.create_date,
                flex: 1,
                minWidth: 180,
                xtype: 'datecolumn',
                hidden: true,
                format: 'M d Y g:ia'
            }, {
                stateId: 'firstName',
                dataIndex: 'billingContact',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.first_name,
                flex: 1,
                width: 120,
                sortable: false,
                getSortParam: function () {
                    return 'billingContact.firstName';
                },
                renderer: function (value, metaData, record) {
                    var firstName = value.firstName;
                    var contacts;

                    if (firstName) {
                        return Ext.util.Format.htmlEncode(value.firstName);
                    } else {
                        contacts = customers.getById(record.get('customerId'));
                        contacts = contacts ? contacts.get('contacts') : [];

                        return contacts && contacts[0] ? Ext.util.Format.htmlEncode(contacts[0].firstName) : 'N/A';
                    }
                }
            }, {
                stateId: 'lastName',
                dataIndex: 'billingContact',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.last_name,
                flex: 1,
                minWidth: 120,
                width: 120,
                sortable: false,
                getSortParam: function () {
                    return 'billingContact.lastName';
                },
                renderer: function (value, metaData, record) {
                    var lastName = value.lastName;
                    var contacts;

                    if (lastName) {
                        return Ext.util.Format.htmlEncode(value.lastName);
                    } else {
                        contacts = customers.getById(record.get('customerId'));
                        contacts = contacts ? contacts.get('contacts') : [];

                        return contacts && contacts[0] ? Ext.util.Format.htmlEncode(contacts[0].lastName) : 'N/A';
                    }
                }
            }, {
                stateId: 'orderTotal',
                dataIndex: 'total',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.order_total,
                renderer: function (value, metaData, record) {
                    return record.formatCurrency(value);
                },
                flex: 1,
                minWidth: 100,
                width: 100
            }, {
                stateId: 'orderStatus',
                dataIndex: 'orderStatus',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.order_status,
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: false,
                renderer: function (value, metaData, record) {
                    var text = record.get('orderStatus'),
                        type = (text === 'Processing').toString();

                    if (text === 'Errored') {
                        type = 'error';
                    }

                    return '<span class="x-column-content-pill x-column-content-pill-' + type + '"">' + text + '</span>';
                }
            }, {
                stateId: 'paymentStatus',
                dataIndex: 'paymentStatus',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.payment_status,
                flex: 1,
                minWidth: 100,
                width: 100
            }, {
                stateId: 'fulfillmentStatus',
                dataIndex: 'fulfillmentStatus',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.fullfillment_status,
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: false
            }, {
                stateId: 'returnStatus',
                dataIndex: 'returnStatus',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.return_status,
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: false
            }, {
                stateId: 'orderType',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.order_type,
                dataIndex: "orderType",
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: true
            }, {
                stateId: 'channelName',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.channel,
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: false,
                renderer: function (value, metaData, record) {
                    return record.getChannelName();
                }
            }, {
                stateId: 'siteName',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.sitename,
                dataIndex: "siteName",
                flex: 1,
                minWidth: 100,
                width: 100,
                hidden: true,
                sortable: false
            }, {
                stateId: 'customerEmail',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.customer_email,
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
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.customer_state,
                dataIndex: 'billingContact',
                flex: 1,
                minWidth: 100,
                width: 100,
                sortable: false,
                hidden: true,
                renderer: function (value, metaData, record) {
                    var stateOrProvince = value.stateOrProvince;
                    var contacts;

                    if (stateOrProvince) {
                        return Ext.util.Format.htmlEncode(value.stateOrProvince);
                    } else {
                        contacts = customers.getById(record.get('customerId'));
                        contacts = contacts ? contacts.get('contacts') : [];

                        return contacts && contacts[0] ? Ext.util.Format.htmlEncode(contacts[0].stateOrProvince) : 'N/A';
                    }
                }
            }, {
                stateId: 'paymentType',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.payment_type,
                dataIndex: 'payments',
                flex: 1,
                minWidth: 120,
                width: 120,
                sortable: false,
                hidden: true,
                renderer: function (value, metaData, record) {
                    if (Ext.isArray(value)) {
                        return Ext.Array.unique(value.map(function (val) { if (val.paymentType === "token") return val.tokenType; else return val.paymentType; }));
                    } else
                        return null;
                }
            }, {
                stateId: 'amountReceived',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.amout_received,
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
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.remaining_amout,
                dataIndex: 'authorizationInfo',
                flex: 1,
                minWidth: 120,
                width: 120,
                sortable: false,
                hidden: true,

                renderer: function (value, metaData, record) {
                    var amount = record.get('total') - value.amountCollected;
                    return record.formatCurrency(amount);
                }
            }, {
                stateId: 'ipAddress',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.ip_address,
                dataIndex: 'ipAddress',
                flex: 1,
                minWidth: 120,
                width: 120,
                sortable: false,
                hidden: true
            }, {
                stateId: 'fraudScore',
                text: Localizer.langResources.ORDERS.Orders.OrderDetails.GridHeader.fraud_score,
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
                    xtype: 'taco.menucolumn',
                    menuItems: [
                        {
                            text: Localizer.langResources.ORDERS.Orders.OrderDetails.ActionsColumn.edit,
                            requiredBehaviors: me.orderUpdateBehaviors,
                            menuColumnHandler: function (item, eventData) {
                                var page = eventData.grid.getParentPage(),
                                    record = eventData.record,
                                    metaData = { id: record.getId() };

                                Taco.core.StateManager.attemptNavigate('/admin/orders/edit/' + record.getId());
                            }
                        }, {
                            text: Localizer.langResources.ORDERS.Orders.OrderDetails.ActionsColumn.capture_payment,
                            itemId: 'capturePaymentAction',
                            requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'paymentUpdate'
                            }],
                            menuColumnHandler: function (item, eventData) {
                                var me = this,
                                    record = eventData.record,
                                    payment = record.payments().getAt(0),

                                    grid = eventData.grid,
                                    index = eventData.rowIndex,
                                    amount = record.getCaptureAmountHint(),
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
                            text: Localizer.langResources.ORDERS.Orders.OrderDetails.ActionsColumn.cancel_order,
                            requiredBehaviors: me.orderUpdateBehaviors,
                            itemId: "cancelAction",
                            menuColumnHandler: function (item, eventData) {
                                var me = this,
                                    record = eventData.record,
                                    grid = eventData.grid,
                                    index = eventData.rowIndex,
                                    row = Ext.get(grid.getView().getNode(record));

                                Ext.MessageBox.show({
                                    title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.cancel_order,
                                    // pushes the buttons to the right to be consistant with our dialog ux.
                                    rightJustifyButtons: true,
                                    // reverses the order of the buttons
                                    reverseOrder: true,
                                    msg: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.warning_cancel_order,
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
                                                        Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_canceling_order, 'error');
                                                        return;
                                                    }
                                                    record.reload();
                                                },
                                                failure: function (response) {
                                                    var json = Ext.decode(response.responseText, true),
                                                        msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_canceling_order;
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


        var createButtonConfig = {
            xtype: 'button',
            text: me.createButtonText,
            requiredBehaviors: {
                model: 'Taco.model.Order',
                behavior: 'create'
            },
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
                        },
                        beforerender: function () {
                            this.setWidth(this.up('button').getWidth());
                        }
                    },
                    items: menu,
                    cls: 'button-menu'
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
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_creating_order, 'error');
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

    },

    onDestroy: function (destroy) {
        if (this.ajaxBeforeListener) {
            this.ajaxBeforeListener.destroy();
        }
        this.callParent(arguments);
    }
});