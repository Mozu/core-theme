/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Taco.shared.view.field.Customer',
        'Taco.view.customers.modal.Contacts',
        'Taco.view.customers.modal.CreateCustomer',
        'Taco.view.order.modal.EditOrderEmail'
    ],

    width: '100%',

    minHeight: 120,

    bodyPadding: 0,

    header: false,

    cls: 'taco-order-header',

    title: 'Customer',

    ui: 'default',

    navigation: false,

    initComponent: function () {
        Ext.util.Format.phone = function (value) {
            return value.length === 10
                ? value.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
                : value
        }

        this.addEvents([
            /**
             * @event beforeload
             * Fired when the header makes a contact change
             * @param {Taco.view.order.header} header The Header object that fired the event
             * @param {Taco.model.CustomerAccount} record The record of the Order
             */
            'addresschanged',
            /**
             * @event customerchanged
             * Fired when the header makes a customer selection
             * @param {Taco.view.order.header} header The Header object that fired the event
             * @param {Taco.model.CustomerAccount} record The record of the Customer Account
             */
            'customerchanged',
            /**
             * @event customerloaded
             * Fired when the header loads a customer record
             * @param {Taco.view.order.header} header The Header object that fired the event
             * @param {Taco.model.CustomerAccount} record The record of the Customer Account
             */
            'customerloaded'
        ]);

        // after the record is reloaded we will need to refresh the ui
        this.mon(this.record, 'aftercommit', this.onRecordChange, this);

        this.on({
            customerchanged: this.checkAddresses,
            scope: this
        });

        this.callParent(arguments);

        this.loadCustomer();
    },

    checkAddresses: function () {
        var billingContact = this.record.get('billingContact'),
            fulfillmentContact = this.record.get('fulfillmentContact');

        if (this.record.getCustomer() && !(billingContact && billingContact.address1 && fulfillmentContact && fulfillmentContact.address1)) {
            this.changeAddress();
        }
    },

    onRecordChange: function () {
        this.updateHeader();
    },

    loadCustomer: function () {
        var me = this;

        this.record.loadCustomer({
            callback: function (record) {
                me.fireEvent('customerloaded', me, record);
                me.loadItems();
            }
        });
    },

    canViewShopperCart: function () {
        return this.record.getCustomer() && this.record.get('orderStatus') === 'Pending';
    },

    showStorefrontModal: function (customerId, userId, orderId) {
        var me = this;
        var modalConfigWindow = null;
        var addCartItems = function (button) {
            modalConfigWindow.setLoading({ msg: 'Loading' });
            Ext.Ajax.request({
                url: '/admin/app/order/addShoppersCartItems?userId=' + userId + '&orderId=' + orderId,
                method: 'POST',
                success: function (response) {
                    modalConfigWindow.setLoading(false);
                    me.record.reload();
                    if (modalConfigWindow) {
                        modalConfigWindow.close();
                    }
                },
                failure: function (response) {
                    modalConfigWindow.setLoading(false);
                    if (modalConfigWindow) {
                        modalConfigWindow.close();
                    }
                }
            });
        };
        var linkOrderToCart = function (cartId) {
            modalConfigWindow.setLoading({ msg: 'Loading' });
            Ext.Ajax.request({
                url: '/admin/app/order/linkOrderToCart?cartId=' + cartId + '&orderId=' + orderId,
                method: 'POST',
                success: function (response) {
                    modalConfigWindow.setLoading(false);
                    me.record.reload();
                },
                failure: function (response) {
                    modalConfigWindow.setLoading(false);
                }
            });
        }
        var configIframe = Ext.create('Ext.ux.IFrame', {
            height: '100%',
            src: '/_gosite/' + Taco.app.context.getSiteId() + '?environment=admin&redir=' + encodeURIComponent('/cart?mz_cust_impersonate=' + customerId),
            listeners: {
                load: function (iframe) {
                    var doc = iframe.getDoc();
                    if (!doc) {
                        return;
                    }

                    // If the shopper is not a registered shopper, the customer account won't have a userId, which is used to lookup the cart.
                    // Impersonating an unregistered shopper should generate a placeholder userId. Brute force that userId out of the page.
                    if (!userId) {
                        var userPreloadScript = doc.getElementById('data-mz-preload-user');
                        if (userPreloadScript && userPreloadScript.textContent) {
                            var userData = JSON.parse(userPreloadScript.textContent);
                            userId = userData.userId;
                        }
                    }

                    // Link the order to the cart. If we submit this order, it should then delete the cart.
                    var cartPreloadScript = doc.getElementById('data-mz-preload-cart');
                    if (cartPreloadScript && cartPreloadScript.textContent) {
                        var cartData = JSON.parse(cartPreloadScript.textContent);
                        var cartId = cartData.id;
                        var originalCartId = me.record.get('originalCartId');

                        // If we haven't linked this order to the cart yet, or if the user's current cart has changed
                        // e.g. the user has done "empty cart", then link the order to this latest cart.
                        if (!originalCartId || (cartId && originalCartId !== cartId)) {
                            linkOrderToCart(cartId);
                        }
                    }

                    if (doc.location && doc.location.pathname && /\/checkout[^\/]*\/([a-zA-Z0-9]+)/.test(doc.location.pathname)) {
                        me.record.reload();
                        if (modalConfigWindow) {
                            modalConfigWindow.close();
                        }
                    }
                },
                scope: this
            }
        });

        modalConfigWindow = Ext.create('Taco.core.ux.window.Drawer', {
            autoShow: true,
            resizable: true,
            draggable: true,
            layout: 'fit',
            autoScroll: false,
            scale: 'large',
            width: '95%',
            height: '95%',
            primaryText: 'Add Items to Order',
            secondaryText: 'Close',
            primaryHandler: addCartItems,
            shadow: true,
            title: 'Do not proceed to checkout after adding items to cart. Use <em>Add Items to Order</em> to complete the order.',
            showActionsBar: false, // Opt for tools in the title.
            actionBar: { dock: 'top' },
            tools: [
                {
                    ui: 'action',
                    xtype: 'button',
                    scale: 'medium',
                    text: 'Add Items to Order',
                    handler: addCartItems,
                    scope: me,
                    margin: '0, 30, 0, 0' // Make room for the close button.
                }
            ],
            items: [
                configIframe
            ]
        });
        modalConfigWindow.center();
    },
    getCustomer: function () {
        return this.record.getCustomer() ? this.record.getCustomer().getData() : {};
    },
    loadItems: function () {
        this.customerLink = Ext.widget({
            xtype: 'component',
            itemId: 'customerLink',
            tpl: [
                '<tpl if="id">',
                '<a href="/admin/customers/edit/{id}/{userId}" data-handle="customerName">', '{[(values.lastNameSafe) ? values.firstNameSafe + " " + values.lastNameSafe : values.emailAddressSafe]}', '</a>',
                '<tpl if="accountType === \'B2B\' ">',
                '<br/><br/>B2B Account: <a href="/admin/b2baccounts/edit/{id}">{companyOrOrganization}</a>',
                '</tpl>',
                '</tpl>'
            ],
            margin: '0, 20, 0, 0',
            data: this.record.getCustomer() ? this.record.getCustomer().getData() : {}
        });

        this.viewCartLink = Ext.widget({
            xtype: 'button',
            ui: 'link',
            text: 'View User\'s Cart',
            itemId: 'viewCartLink',
            hidden: !this.canViewShopperCart(),
            // Customer update behavior required for impersonation.
            requiredBehaviors: [{ model: 'Taco.model.CustomerAccount', behavior: 'update' }],
            handler: function () {
                var custRecord = this.getCustomer();
                this.showStorefrontModal(custRecord.id, custRecord.userId, this.record.getId());
            },
            scope: this
        });

        this.customerCmp = Ext.widget({
            xtype: 'container',
            itemId: 'customerCmp',
            cls: 'pane account-name',
            flex: 33,
            items: [
                {
                    xtype: 'label',
                    text: (this.getCustomer().accountType === 'B2B' ? 'User' : 'Account:'),
                    cls: 'label label-light'
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        this.customerLink,
                        this.viewCartLink
                    ]
                }
            ]
        });

        this.siteCmp = Ext.widget({
            xtype: 'component',
            itemId: 'siteCmp',
            cls: 'pane pane-site',
            flex: 33,
            tpl: ['<span class="label label-light">Site:</span>', '<a href="/_gosite/{siteId}" target="_blank">{siteName}</a>'],
            data: this.record.getData()
        });

        this.changeAddressCmp = Ext.widget({
            xtype: 'container',
            itemId: 'changeAddressCmp',
            cls: 'pane pane-change-address',
            flex: 33,
            items: [{
                xtype: 'label',
                text: 'Addresses:',
                cls: 'label label-light'
            }, {
                xtype: 'button',
                ui: 'link',
                text: 'Change Address',
                itemId: "changeLink",
                requiredBehaviors: [
                    { model: 'Taco.model.Order', behavior: 'update' },
                    { model: 'Taco.model.Order', behavior: 'fulfill' }
                ],
                handler: this.changeAddress,
                scope: this
            }]
        });

        this.relatedCmp = Ext.widget({
            xtype: 'component',
            itemId: 'relatedCmp',
            cls: 'related-orders',
            hidden: !(this.record.get('parentOrderId') || this.record.get('externalId')),
            tpl: [
                '<tpl if="parentOrderId">',
                '<div class="parent-order"><span class="label">Ref Order #:</span><a href="/admin/s-{siteId}/orders/edit/{parentOrderId}">{parentOrderNumber}</a></div>',
                '</tpl>',
                '<tpl if="externalId">',
                '<div class="external-order"><span class="label">External Order #:</span>{externalId}</div>',
                '</tpl>'
            ],
            data: this.record.getData()
        });

        var orderRecord = this.record;
        this.statusCmp = Ext.widget({
            xtype: 'component',
            itemId: 'statusCmp',
            cls: 'pane pane-status',
            flex: 33,
            tpl: ['<table class="order-header-status">',

                //'<tr>', '<td colspan="2"><div class="order-status"><span class="label">Order Status:</span><span data-handle="orderStatus">{orderStatus}</span></div></td>', '</tr>',

                '<tr>', '<td><span class="label-light">Payment</span></td>', '<td><span class="label-light">Fulfillment</span></td>', '</tr>',

                '<tpl if="orderSummary.totalItemCount &gt; 0">',

                '<tr>',
                '<td>',
                '<table class="header-summary">',
                '<tr>',
                '<td>Order Total:</td>',
                '<td data-handle="orderSummaryOrderTotal">{[values.orderRecord.formatCurrency(values.orderSummary.totalAmount)]}</td>',
                '</tr>',
                '<tpl if="this.calculatePending(payments)">',
                '<tr>',
                '<td>Pending:</td>',
                '<td>{[values.orderRecord.formatCurrency(this.calculatePending(values.payments))]}</td>',
                '</tr>',
                '</tpl>',
                '<tr>',
                '<td>Collected:</td>',
                '<td>{[values.orderRecord.formatCurrency(values.orderSummary.amountCollected)]}</td>',
                '</tr><tpl if="amountRefunded"><tr>',
                '<td>Refunded:</td>',
                '<td>{[values.orderRecord.formatCurrency(values.amountRefunded)]}</td>',
                '</tr></tpl><tr>',
                '<td>Balance:</td>',
                '<td>{[values.orderRecord.formatCurrency(values.orderSummary.balance)]}</td>',
                '</tr>',
                '</table>',
                '</td>',
                '<td>',
                '<table class="header-summary">',
                '<tr>',
                '<td>Items:</td>',
                '<td>{orderSummary.totalItemCount}</td>',
                '</tr><tr>',
                '<td>Fulfilled:</td>',
                '<td>{orderSummary.fulfilledItemCount}</td>',
                '</tr><tr>',
                '<td>Remaining:</td>',
                '<td>{orderSummary.unfulfilledItemCount}</td>',
                '</tr>',
                '</table>',
                '</td>',
                '</tr>',

                '<tpl else>',

                '<tr>',
                '<td>',
                '<table class="header-summary">',
                '<tr>',
                '<td>Order Total:</td>',
                '<td data-handle="orderSummaryOrderTotal">N/A</td>',
                '</tr><tr>',
                '<td>Collected:</td>',
                '<td>N/A</td>',
                '</tr><tr>',
                '<td>Balance:</td>',
                '<td>N/A</td>',
                '</tr>',
                '</table>',
                '</td>',
                '<td>',
                '<table class="header-summary">',
                '<tr>',
                '<td>Items:</td>',
                '<td>N/A</td>',
                '</tr><tr>',
                '<td>Fulfilled:</td>',
                '<td>N/A</td>',
                '</tr><tr>',
                '<td>Remaining:</td>',
                '<td>N/A</td>',
                '</tr>',
                '</table>',
                '</td>',
                '</tr>',

                '</tpl>',

                '</table>',
                {
                    calculatePending: function (payments) {
                        var retVal = 0;
                        Ext.Array.each(payments, function (payment) {
                            var paymentData = payment;
                            if (payment.subpayments) {
                                var subpaymentForThisOrder = payment.subpayments.filter(function (subpayment) {
                                    return subpayment.target.targetId == orderRecord.data.id;
                                })[0];

                                if (subpaymentForThisOrder) {
                                    // Attributes that will be replaced with the subpayment's attribute include:
                                    // status, amountCollected, amountCredited, amountRequested, amountRefunded
                                    paymentData = Ext.apply(payment, subpaymentForThisOrder);
                                }
                            }
                            if (paymentData.status === 'Authorized' || paymentData.status === 'Pending' || paymentData.status === 'Invoiced' || paymentData.status === 'PaymentRequested') {
                                retVal += (paymentData.amountRequested - paymentData.amountCollected);
                            }
                        }, this);

                        return retVal;
                    },
                }
            ],
            data: Ext.apply(this.record.getData(), {
                orderRecord: orderRecord,
            })
        });

        this.detailCmp = Ext.widget({
            xtype: 'component',
            itemId: 'detailCmp',
            cls: 'pane pane-detail',
            flex: 33,
            tpl: [
                '<table>',
                '<tr>',
                '<td>',
                '<tpl if="submittedDate">',
                '<span class="label label-light">Order Date:</span>{submittedDate:date("m/d/Y h:i a")}',
                '<tplelse>',
                '<span class="label label-light">Order Create Date:</span>{createDate:date("m/d/Y h:i a")}',
                '</tpl>',
                '</td>',
                '<tpl if="channelName">',
                '<td>', '<span class="label label-light">Channel:</span><span data-handle="channelName">{channelName}</span>', '</td>',
                '<tplelse>',
                '<td>', '<span class="label label-light">Channel:</span><span data-handle="channelName" class="channel-name">N/A</span>', '</td>',
                '</tpl>',
                '</tr>',
                '<tr>',
                '<td>', '<span class="label label-light">Last Updated:</span>{updateDate:date("m/d/Y h:i a")}', '</td>',
                '<tpl if="orderType === \'Online\'">',
                '<td data-handle="ipAddress">', '<span class="label label-light">IP Address:</span>', '<a href="http://whatismyipaddress.com/ip/{ipAddress}" target="_blank">', '{ipAddress}', '</a>', '</td>',
                '<tpl elseif="orderType === \'Offline\'">',
                '<td><span class="label label-light">Offline Order</span></td>',
                '</tpl>',
                '</tr>',
                '<tpl if="parentReturnId">',
                '<tr>',
                '<td>', '<span class="label label-light">Parent Return:</span><span data-handle="parentReturnId"><a href="/admin/s-{[Taco.app.context.getCurrent().id]}/returns/edit/{parentReturnId}">{parentReturnNumber}</a></span>', '</td>',
                '</tr>',
                '</tpl>',
                '</table>'
            ],
            data: Ext.apply({ channelName: this.record.getChannelName(), parentReturnNumber: this.parentReturnNumber }, this.record.getData())
        });

        this.addressesCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            tpl: [
                '<table class="order-addresses-table"><tr><td><span class="label-light">Billing Address</span></td><td><span class="label-light">Shipping Address</span></td></tr>',

                '<tr><td>',

                '<tpl if="billingContact && billingContact.lastName">',

                '<span class="label">{billingContact.firstName:htmlEncode}<tpl if="billingContact.middleName"> {billingContact.middleName:htmlEncode}</tpl> {billingContact.lastName:htmlEncode}</span><br>',

                '<tpl if="billingContact.companyOrOrganization">{billingContact.companyOrOrganization:htmlEncode}<br></tpl>',

                '<tpl if="billingContact.email">{billingContact.email}<br></tpl>',

                '<tpl if="billingContact.address1">',
                '{billingContact.address1:htmlEncode}<br>',
                '<tpl if="billingContact.address2">{billingContact.address2:htmlEncode}<br></tpl>',
                '<tpl if="billingContact.address3">{billingContact.address3:htmlEncode}<br></tpl>',
                '<tpl if="billingContact.address4">{billingContact.address4:htmlEncode}<br></tpl>',
                '{billingContact.cityOrTown:htmlEncode}, {billingContact.stateOrProvince:htmlEncode} {billingContact.postalOrZipCode:htmlEncode} {billingContact.countryCode:htmlEncode}<br>',
                '</tpl>',

                '<tpl if="billingContact.homePhone">{billingContact.homePhone:phone}<br></tpl>',

                '<tplelse>',

                '<div data-handle="order-header-no-billing">n/a</div>',

                '</tpl>',

                '</td><td>',

                '<tpl if="fulfillmentContact && (fulfillmentContact.lastName || fulfillmentContact.email || fulfillmentContact.address1)">',

                '<tpl if="fulfillmentContact.lastName">',
                '<span class="label">{fulfillmentContact.firstName:htmlEncode}<tpl if="fulfillmentContact.middleName"> {fulfillmentContact.middleName:htmlEncode}</tpl> {fulfillmentContact.lastName:htmlEncode}</span><br>',
                '</tpl>',

                '<tpl if="fulfillmentContact.email">{fulfillmentContact.email}<br></tpl>',

                '<tpl if="fulfillmentContact.companyOrOrganization">{fulfillmentContact.companyOrOrganization:htmlEncode}<br></tpl>',

                '<tpl if="fulfillmentContact.address1">',
                '{fulfillmentContact.address1:htmlEncode}<br>',
                '<tpl if="fulfillmentContact.address2">{fulfillmentContact.address2:htmlEncode}<br></tpl>',
                '<tpl if="fulfillmentContact.address3">{fulfillmentContact.address3:htmlEncode}<br></tpl>',
                '<tpl if="fulfillmentContact.address4">{fulfillmentContact.address4:htmlEncode}<br></tpl>',
                '{fulfillmentContact.cityOrTown:htmlEncode}, {fulfillmentContact.stateOrProvince:htmlEncode} {fulfillmentContact.postalOrZipCode:htmlEncode} {fulfillmentContact.countryCode:htmlEncode}<br>',
                '</tpl>',

                '<tpl if="fulfillmentContact.homePhone">{fulfillmentContact.homePhone:phone}<br></tpl>',

                '<tplelse>',

                '<div data-handle="order-header-no-fulfillment">n/a</div>',

                '</tpl>',

                '</td></tr></table>'
            ],
            data: this.record.getData()
        });

        this.emailCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            tpl: [
                '{email:htmlEncode}'
            ],
            data: this.record.getData()

        });
        this.emailContainer = Ext.widget({
            xtype: 'container',
            itemId: 'emailCmps',
            cls: 'pane  pane-change-address',
            flex: 33,
            style: 'padding-left: 0px;',
            data: this.record.getData(),
            items: [
                {
                    xtype: 'label',
                    text: 'Email:',
                    cls: 'label label-light'
                }, this.emailCmp, {
                    xtype: 'button',
                    ui: 'link',
                    text: 'Edit Email Address',
                    itemId: "changeEmailLink",
                    requiredBehaviors: [
                        { model: 'Taco.model.Order', behavior: 'update' },
                        { model: 'Taco.model.Order', behavior: 'fulfill' }
                    ],
                    handler: this.changeEmailAddress,
                    scope: this
                }
            ]
        });

        this.addressesContainer = Ext.widget({
            xtype: 'container',
            itemId: 'addressesContainer',
            cls: 'pane pane-addresses',
            flex: 33,
            hidden: !this.record.getCustomer(),
            items: [this.addressesCmp, this.emailContainer]
        });
        this.customerSelector = Ext.widget({
            xtype: 'taco-customerfield',
            itemId: 'customerSelector',
            showAnonymousCustomers: true,
            filterByCustomerSet: true,
            width: 300,
            emptyText: 'Customer Search',
            disabled: Taco.user.isFulfillerUser,
            listeners: {
                select: function (combo, records) {
                    // need to check to see if the custtomer has an email address for the default shipping address.
                    // if not, need to prompt user to edit the customer on the customer detail view.
                    if (records[0]) {
                        var customer = records[0];
                        if (this.isCustomerValid(customer)) {
                            this.changeCustomer(customer);
                        }
                    }
                },
                scope: this
            }
        });

        this.customerSelectionContainer = Ext.widget({
            xtype: 'container',
            itemId: 'customerSelectionContainer',
            cls: 'pane pane-customer',
            flex: 40,
            hidden: !!this.record.getCustomer(),
            items: [
                this.customerSelector, {
                    xtype: 'button',
                    ui: 'action-primary',
                    scale: 'medium',
                    itemId: "createNewCustomerButton",
                    text: 'Create New Customer',
                    handler: this.createCustomer,
                    scope: this,
                    requiredBehaviors: [{
                        model: 'Taco.model.Order',
                        behavior: 'createCustomer'
                    }]
                }
            ]
        });

        this.dataContainer = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                this.statusCmp,
                this.detailCmp,
                this.addressesContainer,
                this.customerSelectionContainer
            ]
        });

        this.tableHeaderContainer = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            cls: 'taco-order-summary-header',
            items: [
                this.customerCmp,
                this.siteCmp,
                this.changeAddressCmp
            ]
        });

        this.removeAll();

        this.add([
            this.tableHeaderContainer,
            this.dataContainer,
            this.relatedCmp
        ]);

        //set the default focus
        if (!!this.record.getCustomer()) {
            var changeLink = this.down("#changeLink");
            changeLink.focus();
        } else {
            this.customerSelector.focus();
        }
    },

    isCustomerValid: function (customer) {
        var me = this,
            isValid = true;

        // need to check to see if the customer has an email address on the default shipping address.
        var defaultShippingAddress = Ext.Array.findBy(customer.data.contacts, function (contact) {
            return contact.isPrimaryShipping;
        });

        // if we have a default shipping address that lacks an email. prompty
        if (defaultShippingAddress && !defaultShippingAddress.email) {
            isValid = false;
            Ext.MessageBox.show({
                title: "Invalid Shipping Address",
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: "<div style='padding:0px 10px ;'>The customer's default shipping address is missing an email address.<div style='padding-top:20px'>Edit customer now?</div>",
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        Taco.core.StateManager.attemptNavigate("/admin/customers/edit/" + customer.data.id);
                    } else {
                        me.customerSelector.reset();
                        me.customerSelector.focus(true);
                    }
                }
            });
        }

        return isValid;
    },

    updateHeader: function () {
        var data = this.record.getData();

        Ext.suspendLayouts();

        this.customerLink.update(this.record.getCustomer() ? this.record.getCustomer().getData() : {});
        this.viewCartLink[this.canViewShopperCart() ? 'show' : 'hide']();
        this.detailCmp.update(Ext.apply({ channelName: this.record.getChannelName() }, data));
        this.statusCmp.update(Ext.apply({}, { orderRecord: this.record }, data));
        this.addressesCmp.update(data);
        this.emailCmp.update(data);
        this.relatedCmp.update(data);
        this.relatedCmp[(data.externalId || data.parentOrderId) ? 'show' : 'hide']();
        this.addressesContainer[this.record.getCustomer() ? 'show' : 'hide']();
        this.customerSelectionContainer[this.record.getCustomer() ? 'hide' : 'show']();

        Ext.resumeLayouts(true);

        var changeLink = this.down("#changeLink");
        changeLink.focus();
    },

    createCustomer: function () {
        var me = this;
        Ext.create('Taco.view.customers.modal.CreateCustomer', {
            order: this.record,
            listeners: {
                scope: me,
                aftercancelclose: function () {
                    var createNewCustomerButton = this.down("#createNewCustomerButton");
                    createNewCustomerButton.focus();
                },
                aftersaveclose: function () {
                    me.fireEvent('addresschanged', me, me.record);
                    me.updateHeader();
                }
            }
        });
    },

    changeAddress: function (focusAfterCloseCmp) {
        if (this.record.get('isUnified')) {
            var me = this;
            var customerRecord = this.record.getCustomer();
            customerRecord.phantom = false;
            Ext.create('Taco.view.customers.modal.Contacts', {
                record: customerRecord,
                order: this.record,
                listeners: {
                    scope: me,
                    afterclose: function () {
                        if (focusAfterCloseCmp) {
                            focusAfterCloseCmp.focus();
                        }
                    },
                    aftersaveclose: function () {
                        me.fireEvent('addresschanged', me, me.record);
                        me.updateHeader();
                    }
                }
            });
        }
    },

    changeEmailAddress: function (focusAfterCloseCmp) {
        var me = this;
        Ext.create('Taco.view.order.modal.EditOrderEmail', {
            record: this.record,
            listeners: {
                scope: me,
                afterclose: function () {
                    if (focusAfterCloseCmp) {
                        focusAfterCloseCmp.focus();
                    }
                },
                aftersaveclose: function () {
                    me.fireEvent('addresschanged', me, me.record);
                    me.updateHeader();
                }
            }
        });
    },

    changeCustomer: function (customerRecord) {
        this.record.setCustomer({
            jsonData: {
                orderId: this.record.getId(),
                customerAccountId: customerRecord.get('id'),
                userId: customerRecord.get('userId')
            },
            callback: function (options, success, response) {
                if (!success) {
                    var message = 'Failed to assign customer account on this order.';
                    try {
                        var responseMessage = JSON.parse(response.responseText).message;
                        message = message + ' ' + responseMessage;
                    } catch (e) { }
                    Taco.app.fireEvent('setmessage', message, 'error');
                    console.error(options, response);
                    return;
                }

                this.record.set(Ext.decode(response.responseText).items);

                this.record.commit();

                this.record.loadCustomer({
                    callback: function () {
                        this.fireEvent('customerchanged', this, this.record.getCustomer());
                        this.updateHeader();
                    },
                    scope: this
                });
            },
            scope: this
        });
    }
});
