Ext.define('Taco.view.order.subform.fulfillment.InStorePickup', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-in-store-pickup',

    title: 'In-store Pickup',

    initComponent: function() {

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingPickups();

        this.buildUnPickedUpPackages();

        this.buildPickedUpPackages();

        this.callParent(arguments);
    },

    buildInfoHeader: function() {
        this.items.push(Ext.widget({
            xtype: 'container',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items: [{
                padding: '0 50 0 0',
                tpl: [
                    '<span class="taco-order-label">Customer:</span><br>',
                    '{billingContact.firstName}<tpl if="billingContact.middleName"> {billingContact.middleName}</tpl> {billingContact.lastName}<br>',
                    '{billingContact.address1}<br>',
                    '<tpl if="billingContact.address2">{billingContact.address2}<br></tpl>',
                    '<tpl if="billingContact.address3">{billingContact.address3}<br></tpl>',
                    '<tpl if="billingContact.address4">{billingContact.address4}<br></tpl>',
                    '{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}',
                    '<tpl if="billingContact.homePhone"><br>{billingContact.homePhone}</tpl>',
                    '<tpl if="billingContact.mobilePhone"><br>{billingContact.mobilePhone}</tpl>',
                    '<tpl if="billingContact.workPhone"><br>{billingContact.workPhone}</tpl>'
                ]
            }, {
                flex: 1,
                style: {
                    textAlign: 'right'
                },
                tpl: [
                    'Pending Items: {itemsNotPickedup}<br>',
                    'Fulfilled Items: {itemsPickedup}<br>',
                    '<span class="taco-order-label">In Store Pickup Items: {totalPickupItems}</span>'
                ]
            }]
        }));
    },

    buildPendingPickups: function() {
        var items = this.record.get('unpickedupItems');

        if (!items.length) return;

        this.items.push(Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            data: items,
            unfulfilledFieldName: 'pendingPickups',
            moveToNewText: 'New Pickup'
        }));
    },

    buildUnPickedUpPackages: function() {
        Ext.each(this.record.get('pendingPickups'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.InStorePackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    },

    buildPickedUpPackages: function() {
        Ext.each(this.record.get('pickedupPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.InStorePackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    }
});