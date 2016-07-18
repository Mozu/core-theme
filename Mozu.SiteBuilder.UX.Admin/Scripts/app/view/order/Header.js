/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Taco.shared.view.field.Customer',
        'Taco.view.customers.modal.Contacts',
        'Taco.view.customers.modal.CreateCustomer'
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

    loadItems: function () {
        this.customerCmp = Ext.widget({
            xtype: 'component',
            itemId: 'customerCmp',
            cls: 'pane account-name',
            flex: 33,
            tpl: [
                '<span class="label label-light">Account:</span>',
                '<tpl if="id">',
                '<a href="/admin/customers/edit/{id}" data-handle="customerName">', '{[(values.lastNameSafe) ? values.firstNameSafe + " " + values.lastNameSafe : values.emailAddressSafe]}', '</a>',
                '</tpl>'
            ],
            data: this.record.getCustomer() ? this.record.getCustomer().getData() : {}
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
            },{
                xtype: 'button',
                ui: 'link',
                text: 'Change Address',
                itemId: "changeLink",
                requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update'
                            },
                           {
                               model: 'Taco.model.Order',
                               behavior: 'fulfill'
                           }],
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
                            if (payment.status === 'Authorized' || payment.status === 'Pending') {
                                if (payment.paymentType === 'Check') {
                                    retVal += payment.amountRequested;
                                } else {
                                    retVal += payment.amountAuthorized;
                                }
                            }
                        }, this);

                        return retVal;
                    },
                }
            ],
            data: Ext.apply(this.record.getData(), {
                orderRecord: this.record,
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
                '<td>','<span class="label label-light">Parent Return Id:</span><span data-handle="parentReturnId"><a href="/admin/s-{[Taco.app.context.getCurrent().id]}/orders/edit/{parentOrderId}?returnId={parentReturnId}">{parentReturnNumber}</a></span>','</td>',
                '</tr>',
                '</tpl>',
                '</table>'
            ],
            data: Ext.apply( { channelName: this.record.getChannelName(), parentReturnNumber: this.parentReturnNumber }, this.record.getData())
        });

        this.addressesCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            tpl: [
                '<table class="order-addresses-table"><tr><td><span class="label-light">Billing Address</span></td><td><span class="label-light">Shipping Address</span></td></tr>',


                '<tr><td>',

                '<tpl if="billingContact && billingContact.address1">',

                '<span class="label">{billingContact.firstName:htmlEncode}<tpl if="billingContact.middleName"> {billingContact.middleName:htmlEncode}</tpl> {billingContact.lastName:htmlEncode}</span><br>',

                '<tpl if="billingContact.email">{billingContact.email}<br></tpl>',

                '{billingContact.address1:htmlEncode}<br>',

                '<tpl if="billingContact.address2">{billingContact.address2:htmlEncode}<br></tpl>',

                '<tpl if="billingContact.address3">{billingContact.address3:htmlEncode}<br></tpl>',

                '<tpl if="billingContact.address4">{billingContact.address4:htmlEncode}<br></tpl>',

                '{billingContact.cityOrTown:htmlEncode}, {billingContact.stateOrProvince:htmlEncode} {billingContact.postalOrZipCode:htmlEncode} {billingContact.countryCode:htmlEncode}<br>',

                '<tplelse>',

                '<div data-handle="order-header-no-billing">n/a</div>',

                '</tpl>',

                '</td><td>',

                '<tpl if="fulfillmentContact && fulfillmentContact.address1">',

                '<span class="label">{fulfillmentContact.firstName:htmlEncode}<tpl if="fulfillmentContact.middleName"> {fulfillmentContact.middleName:htmlEncode}</tpl> {fulfillmentContact.lastName:htmlEncode}</span><br>',

                '<tpl if="fulfillmentContact.email">{fulfillmentContact.email}<br></tpl>',

                '{fulfillmentContact.address1:htmlEncode}<br>',

                '<tpl if="fulfillmentContact.address2">{fulfillmentContact.address2:htmlEncode}<br></tpl>',

                '<tpl if="fulfillmentContact.address3">{fulfillmentContact.address3:htmlEncode}<br></tpl>',

                '<tpl if="fulfillmentContact.address4">{fulfillmentContact.address4:htmlEncode}<br></tpl>',

                '{fulfillmentContact.cityOrTown:htmlEncode}, {fulfillmentContact.stateOrProvince:htmlEncode} {fulfillmentContact.postalOrZipCode:htmlEncode} {fulfillmentContact.countryCode:htmlEncode}<br>',

                '<tplelse>',

                '<div data-handle="order-header-no-fulfillment">n/a</div>',

                '</tpl>',

                '</td></tr></table>'
            ],
            data: this.record.getData()
        });

        this.addressesContainer = Ext.widget({
            xtype: 'container',
            itemId: 'addressesContainer',
            cls: 'pane pane-addresses',
            flex: 33,
            hidden: !this.record.getCustomer(),
            items: [/*{
                    xtype: 'component',
                    cls: 'order-addresses',
                    autoEl: {
                        tag: 'div',
                        html: '<span class="label">Order Addresses</span>'
                    }
            }, {
                    xtype: 'button',
                    ui: 'link',
                    text: '(Change)',
                    itemId: "changeLink",
                    handler: this.changeAddress,
                    scope: this
            },*/
                this.addressesCmp]
        });

        this.customerSelector = Ext.widget({
            xtype: 'taco-customerfield',
            itemId: 'customerSelector',
            showAnonymousCustomers: true,
            filterByCustomerSet: true,
            width: 300,
            emptyText: 'Customer Search',
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
            this.customerSelector.focus()
        }

    },
    
    isCustomerValid: function (customer) {
        var me = this,
            isValid = true;

        // need to check to see if the customer has an email address on the default shipping address.
        var defaultShippingAddress = Ext.Array.findBy(customer.data.contacts, function (contact) {
            return contact.isPrimaryShipping
        })
        
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

        return isValid
    },

    updateHeader: function () {
        var data = this.record.getData();
        
        Ext.suspendLayouts();

        this.customerCmp.update(this.record.getCustomer() ? this.record.getCustomer().getData() : {});
        this.detailCmp.update( Ext.apply({ channelName: this.record.getChannelName() }, data));
        this.statusCmp.update(Ext.apply({}, { orderRecord: this.record }, data));
        this.addressesCmp.update(data);
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
        var me = this;

        Ext.create('Taco.view.customers.modal.Contacts', {
            record: this.record.getCustomer(),
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
    },

    changeCustomer: function (customerRecord) {

        this.record.setCustomer({
            jsonData: {
                orderId: this.record.getId(),
                customerAccountId: customerRecord.getId()
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