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

    header: false,

    title:"Customer",

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

        this.callParent(arguments);

        this.loadCustomer();
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
            tpl: [
                'Account ',
                '<tpl if="id">',
                '<a href="/admin/customers/{id}" data-handle="customerName">', '{firstNameSafe} {lastNameSafe}', '</a>',
                '</tpl>'
            ],
            data: this.record.getCustomer() ? this.record.getCustomer().getData() : {}
        });


        this.detailCmp = Ext.widget({
            xtype: 'component',
            itemId: 'detailCmp',
            flex: 1,
            tpl: ['<div>', 'Order # {orderNumber}', '</div>',

                '<div>', 'Order Date: {createDate:date("m/d/Y h:i a")}', '</div>',

                '<div>', 'Last Updated: {updateDate:date("m/d/Y h:i a")}', '</div>',

                '<div>', 'Site: <a href="http://{siteName}" target="_blank">{siteName}</a>', '</div>',

                '<div>', 'Channel: <span data-handle="channelName">{orderType}', '</div>',

                '<tpl if="orderType === \'Online\'">',

                '<div data-handle="ipAddress">', 'IP Address: ', '<a href="http://whatismyipaddress.com/ip/{ipAddress}" target="_blank">', '{ipAddress}', '</a>', '</div>',

                '</tpl>',

                '<div>', '', '</div>',

                '<div>', '', '</div>'
            ],
            data: this.record.getData()
        });

        this.statusCmp = Ext.widget({
            xtype: 'component',
            itemId: 'statusCmp',
            flex: 1,
            tpl: ['<table class="taco-order-header-status">',

                '<tr>', '<td colspan="2">Order Status: <span data-handle="orderStatus">{orderStatus}</span></td>', '</tr>',

                '<tr>', '<td>Payment</td>', '<td>Fulfillment</td>', '</tr>',

                '<tpl if="orderSummary.totalItemCount &gt; 0">',

                '<tr>', '<td><div class="taco-justify">', '<span>Order Total:</span>', '<span data-handle="orderSummaryOrderTotal">{orderSummary.totalAmount:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Items:</span>', '<span>{orderSummary.totalItemCount}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Collected:</span>', '<span>{orderSummary.amountCollected:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Shipped:</span>', '<span>{orderSummary.fulfilledItemCount}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Balance:</span>', '<span>{orderSummary.balance:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Remaining:</span>', '<span>{orderSummary.unfulfilledItemCount}</span>', '</div></td>', '</tr>',

                '<tplelse>',

                '<tr>', '<td><div class="taco-justify">', '<span>Order Total:</span>', '<span data-handle="orderSummaryOrderTotal">N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Items:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Collected:</span>', '<span>N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Shipped:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Balance:</span>', '<span>N/A</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Remaining:</span>', '<span>N/A</span>', '</div></td>', '</tr>',

                '</tpl>',

                '</table>'
            ],
            data: this.record.getData()
        });

        this.addressesCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            flex: 2,
            tpl: [
                '<table><tr><td>Billing Address</td><td>Shipping Address</td></tr>',


                '<tr>',

                '<tpl if="billingContact">',

                '<td>{billingContact.firstName} {billingContact.lastName}<br>',

                '{billingContact.address1}<br>',

                '<tpl if="billingContract.address2">{billingContact.address2}<br></tpl>',

                '<tpl if="billingContract.address2">{billingContact.address2}<br></tpl>',

                '<tpl if="billingContract.address3">{billingContact.address3}<br></tpl>',

                '<tpl if="billingContract.address4">{billingContact.address4}<br></tpl>',

                '{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}<br>',

                '',

                '<tplelse>',

                '</tpl>',

                '</td><td>',

                '<tpl if="fulfillmentContact">',

                '{fulfillmentContact.firstName} {fulfillmentContact.lastName}<br>',

                '{fulfillmentContact.address1}<br>',

                '<tpl if="fulfillmentContact.address2">{fulfillmentContact.address2}<br></tpl>',

                '<tpl if="fulfillmentContact.address3">{fulfillmentContact.address3}<br></tpl>',

                '<tpl if="fulfillmentContact.address4">{fulfillmentContact.address4}<br></tpl>',

                '{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode} {fulfillmentContact.countryCode}<br>',

                '</tpl>',

                '</td></tr></table>'
            ],
            data: this.record.getData()
        });

        this.addressesContainer = Ext.widget({
            xtype: 'container',
            itemId: 'addressesContainer',
            flex: 2,
            hidden: this.record.getCustomer() == null,
            items: [{
                xtype: 'component',
                html: 'Order Addresses'
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
            flex: 1,
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
            flex: 2,
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
            callback: function() {
                me.fireEvent('customerchanged', me, me.record.getCustomer());
                me.updateHeader();
            }
        });
    },

    changeAddress: function() {
        var me = this;
        Ext.create('Taco.view.customers.modal.Contacts', {
            record: this.record.getCustomer(),
            order: this.record,
            callback: function() {
                me.fireEvent('addresschanged', me, me.record);
                me.updateHeader();
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
