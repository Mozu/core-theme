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

    initComponent: function() {

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
            'customerchanged'
        ]);

        // after the record is reloaded we will need to refresh the ui
        this.mon(this.record, "aftercommit", this.onRecordChange, this);

        this.callParent(arguments);

        this.loadCustomer();
    },

    onRecordChange: function () {        
        this.updateHeader();
    },

    loadCustomer: function() {
        var me = this;

        this.record.loadCustomer({
            callback: function() {
                me.loadItems();
            }
        });
    },

    loadItems: function() {
        this.customerCmp = Ext.widget({
            xtype: 'component',
            itemId: 'customerCmp',
            cls: 'account-name',
            tpl: [
                '<span class="label label-light">Account</span>',
                '<tpl if="id">',
                '<a href="/admin/customers/edit/{id}" data-handle="customerName">', '{firstNameSafe} {lastNameSafe}', '</a>',
                '</tpl>'
            ],
            data: this.record.getCustomer() ? this.record.getCustomer().getData() : {}
        });


        this.detailCmp = Ext.widget({
            xtype: 'component',
            itemId: 'detailCmp',
            cls: 'pane pane-detail',
            flex: 27,
            tpl: ['<div class="order-number">', '<span class="label">Order #</span>{orderNumber}', '</div>',

                '<div class="create-date">', '<span class="label">Order Date:</span>{createDate:date("m/d/Y h:i a")}', '</div>',

                '<div class="update-date">', '<span class="label">Last Updated:</span>{updateDate:date("m/d/Y h:i a")}', '</div>',

                '<div class="site">', '<span class="label">Site:</span><a href="http://{siteName}" target="_blank">{siteName}</a>', '</div>',

                '<div class="channel">', '<span class="label">Channel:</span><span data-handle="channelName">{orderType}', '</div>',

                '<tpl if="orderType === \'Online\'">',

                '<div class="ip-address" data-handle="ipAddress">', '<span class="label">IP Address:</span>', '<a href="http://whatismyipaddress.com/ip/{ipAddress}" target="_blank">', '{ipAddress}', '</a>', '</div>',

                '</tpl>',

                '<div>', '', '</div>',

                '<div>', '', '</div>'
            ],
            data: this.record.getData()
        });

        this.statusCmp = Ext.widget({
            xtype: 'component',
            itemId: 'statusCmp',
            cls: 'pane pane-status',
            flex: 33,
            tpl: ['<table class="taco-order-header-status">',

                '<tr>', '<td colspan="2"><div class="order-status"><span class="label">Order Status:</span><span data-handle="orderStatus">{orderStatus}</span></div></td>', '</tr>',

                '<tr>', '<td><span class="label-light">Payment</span></td>', '<td><span class="label-light">Fulfillment</span></td>', '</tr>',

                '<tpl if="orderSummary.totalItemCount &gt; 0">',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Order Total:</span>', '<span data-handle="orderSummaryOrderTotal">{[values.orderRecord.formatCurrency(values.orderSummary.totalAmount)]}</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Items:</span>', '<span>{orderSummary.totalItemCount}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Collected:</span>', '<span>{[values.orderRecord.formatCurrency(values.orderSummary.amountCollected)]}</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Shipped:</span>', '<span>{orderSummary.fulfilledItemCount}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Balance:</span>', '<span>{[values.orderRecord.formatCurrency(values.orderSummary.balance)]}</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Remaining:</span>', '<span>{orderSummary.unfulfilledItemCount}</span>', '</div></td>', '</tr>',

                '<tplelse>',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Order Total:</span>', '<span data-handle="orderSummaryOrderTotal">N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Items:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Collected:</span>', '<span>N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Shipped:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span class="label">Balance:</span>', '<span>N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span class="label">Remaining:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '</tpl>',

                '</table>'
            ],
            data: Ext.apply( this.record.getData(), {orderRecord:this.record})
        });

        this.addressesCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            tpl: [
                '<table><tr><td><span class="label-light">Billing Address</span></td><td><span class="label-light">Shipping Address</span></td></tr>',


                '<tr><td>',

                '<tpl if="billingContact && billingContact.address1">',

                '<span class="label">{billingContact.firstName}<tpl if="billingContact.middleName"> {billingContact.middleName}</tpl> {billingContact.lastName}</span><br>',

                '{billingContact.address1}<br>',

                '<tpl if="billingContact.address2">{billingContact.address2}<br></tpl>',

                '<tpl if="billingContact.address3">{billingContact.address3}<br></tpl>',

                '<tpl if="billingContact.address4">{billingContact.address4}<br></tpl>',

                '{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}<br>',

                '<tplelse>',

                '<div data-handle="order-header-no-billing">n/a</div>',

                '</tpl>',

                '</td><td>',

                '<tpl if="fulfillmentContact && fulfillmentContact.address1">',

                '<span class="label">{fulfillmentContact.firstName}<tpl if="fulfillmentContact.middleName"> {fulfillmentContact.middleName}</tpl> {fulfillmentContact.lastName}</span><br>',

                '{fulfillmentContact.address1}<br>',

                '<tpl if="fulfillmentContact.address2">{fulfillmentContact.address2}<br></tpl>',

                '<tpl if="fulfillmentContact.address3">{fulfillmentContact.address3}<br></tpl>',

                '<tpl if="fulfillmentContact.address4">{fulfillmentContact.address4}<br></tpl>',

                '{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode} {fulfillmentContact.countryCode}<br>',

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
            flex: 40,
            hidden: this.record.getCustomer() == null,
            items: [{
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
                handler: this.changeAddress,
                scope: this
            }, this.addressesCmp]
        });

        this.customerSelector = Ext.widget({
            xtype: 'taco-customerfield',
            itemId: 'customerSelector',
            width: '100%',
            emptyText: 'Customer Search',
            listeners: {
                select: function(combo, records, eOpts) {
                    if (records[0]) this.changeCustomer(records[0]);
                },
                scope: this
            }
        });

        this.customerSelectionContainer = Ext.widget({
            xtype: 'container',
            itemId: 'customerSelectionContainer',
            cls: 'pane pane-customer',
            flex: 40,
            hidden: this.record.getCustomer() !== null,
            items: [
                this.customerSelector, {
                    xtype: 'button',
                    ui: 'action-primary',
                    scale: 'medium',
                    text: 'Create New Customer',
                    handler: this.createCustomer,
                    scope: this
                }
            ]
        });

        this.dataContainer = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                this.detailCmp,
                this.statusCmp,
                this.addressesContainer,
                this.customerSelectionContainer
            ]
        });

        this.removeAll();

        this.add([
            this.customerCmp,
            this.dataContainer
        ]);

        
    },

    updateHeader: function() {

        Ext.suspendLayouts();

        this.customerCmp.update(this.record.getCustomer() ? this.record.getCustomer().getData() : {});
        this.detailCmp.update(this.record.getData());
        this.statusCmp.update(this.record.getData());
        this.addressesCmp.update(this.record.getData());

        this.addressesContainer[this.record.getCustomer() ? 'show' : 'hide']();
        this.customerSelectionContainer[this.record.getCustomer() ? 'hide' : 'show']();

        Ext.resumeLayouts(true);
    },

    createCustomer: function() {
        var me = this;
        Ext.create('Taco.view.customers.modal.CreateCustomer', {
            order: this.record,
            listeners: {
                scope: me,
                aftersaveclose: function (view, record) {                    
                    me.fireEvent('addresschanged', me, me.record);
                    me.updateHeader();
                }
            }
        });
    },

    changeAddress: function() {
        var me = this;
        Ext.create('Taco.view.customers.modal.Contacts', {
            record: this.record.getCustomer(),
            order: this.record,
            listeners: {
                scope: me,
                aftersaveclose: function (view, record) {                    
                    me.fireEvent('addresschanged', me, me.record);
                    me.updateHeader();
                }
            }
        });
    },

    changeCustomer: function(customerRecord) {
        
        this.record.setCustomer({
            jsonData: {
                orderId: this.record.getId(),
                customerAccountId: customerRecord.getId()
            },
            callback: function(options, success, response) {
                if (!success) {
                    Taco.app.fireEvent('setmessage', 'Failed to set Assign Customer Account to this Order');
                    console.error(options, response);
                    return;
                }
                
                this.record.set(Ext.decode(response.responseText).items);

                this.record.commit();

                this.record.loadCustomer({
                    callback: function() {
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
