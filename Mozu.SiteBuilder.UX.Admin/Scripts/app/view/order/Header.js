/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.Container',

    title: 'Overview',

    border: 1,
    padding: 5,
    margin: 20,
    style: {
        borderColor: 'red',
        borderStyle: 'solid'
    },

    initComponent: function() {
        

        this.callParent(arguments);

        this.loadCustomer();

    },

    loadCustomer: function() {
        var me = this;

        this.record.getCustomer(function() {
            me.loadItems();
        }, function() {
            alert('shit\'s broke yo');
        });
    },

    loadItems: function() {
        this.customerCmp = Ext.widget({
            xtype: 'component',
            itemId: 'customerCmp',
            tpl: ['Account ', '<a href="/admin/customers/{id}">', '{name}', '</a>'],
            data: this.record.customer.getData()
        });


        this.detailCmp = Ext.widget({
            xtype: 'component',
            itemId: 'detailCmp',
            flex: 1,
            tpl: ['<div>', 'Order # {orderNumber}', '</div>',

                '<div>', 'Order Date: {createDate:date("m/d/Y h:i a")}', '</div>',

                '<div>', 'Last Updated: {updateDate:date("m/d/Y h:i a")}', '</div>',

                '<div>', 'Site: <a href="http://{siteName}">{siteName}</a>', '</div>',

                '<div>', 'Channel: <span data-field="channelName">{channelName}', '</div>',

                '<div>', 'IP Address: ', '<a href="http://whatismyipaddress.com/ip/{ipAddress}">', '{ipAddress}', '</a>', '</div>',

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

                '<tr>', '<td colspan="2">Order Status: <span data-field="orderStatus">{orderStatus}</span></td>', '</tr>',

                '<tr>', '<td>Payment</td>', '<td>Fulfillment</td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Order Total:</span>', '<span>{orderTotal:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Items:</span>', '<span>{itemsTotal}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Collected:</span>', '<span>{collected:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Shipped:</span>', '<span>{shipped}</span>', '</div></td>', '</tr>',

                '<tr>', '<td><div class="taco-justify">', '<span>Balance:</span>', '<span>{balance:currency}</span>', '</div></td>', '<td><div class="taco-justify">', '<span>Remaining:</span>', '<span>{remaining}</span>', '</div></td>', '</tr>',

                '</table>'
            ],
            data: this.record.getData()
        });


        this.addressesCmp = Ext.widget({
            xtype: 'component',
            itemId: 'addressesCmp',
            flex: 2,
            hidden: this.record.customer === null,
            tpl: [
                '<div>Order Addresses <a href="#">(Change)</a>',

                '<table><tr><td>Billing Address</td><td>Shipping Address</td></tr>',


                '<tr>',

                '<tpl if="billingContact">',

                '<td>{billingContact.firstName} {billingContact.lastName}<br>',

                '{billingContact.address1}<br>',

                '<tpl if="billingContract.address2">{billingContact.address2}<br></tpl>',

                '{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}<br>',

                '',

                '<tplelse>',

                '</tpl>',

                '</td><td>',

                '<tpl if="fulfillmentContact">',

                '{fulfillmentContact.firstName} {fulfillmentContact.lastName}<br>',

                '{fulfillmentContact.address1}<br>',

                '<tpl if="fulfillmentContact.address2">{fulfillmentContact.address2}<br></tpl>',

                '{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode} {fulfillmentContact.countryCode}<br>',

                '</tpl>',

                '</td></tr></table>'
            ],
            data: this.record.getData()
        });

        this.customerSelectionContainer = Ext.widget({
            xtype: 'container',
            itemId: 'customerSelectionContainer',
            flex: 2,
            hidden: this.record.customer !== null,
            items: [{
                xtype: 'component',
                html: 'stuff'
            }]
        });

        this.dataContainer = Ext.create('Ext.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            padding: 5,
            items: [
                this.detailCmp,
                this.statusCmp,
                this.addressesCmp,
                this.customerSelectionContainer
            ]
        });

        this.removeAll();
        
        this.add([
            this.customerCmp,
            this.dataContainer
        ]);
    }
});