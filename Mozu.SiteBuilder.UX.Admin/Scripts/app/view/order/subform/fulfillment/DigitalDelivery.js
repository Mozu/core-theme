Ext.define('Taco.view.order.subform.fulfillment.DigitalDelivery', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    requires: [

    ],
    alias: 'widget.taco-order-fulfillment-digital-delivery',

    initComponent: function () {

        this.title = '<span class="section-header">Gift Card</span>',

        this.items = [];

        this.buildInfoHeader();

        this.buildPendingDigitalItems();

        this.buildDeliveredDigitalItems();

        this.callParent(arguments);
    },

    buildInfoHeader: function () {
        this.items.push(Ext.widget({
            xtype: 'container',
            padding: '0 0 10 0',
            cls: 'taco-order-fulfillment-info-header',
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
                    '<span class="label">Customer:</span><br>',
                    '{billingContact.firstName:stripTags}<tpl if="billingContact.middleName"> {billingContact.middleName:stripTags}</tpl> {billingContact.lastName:stripTags}<br>',
                    '{billingContact.address1:stripTags}<br>',
                    '<tpl if="billingContact.address2">{billingContact.address2:stripTags}<br></tpl>',
                    '<tpl if="billingContact.address3">{billingContact.address3:stripTags}<br></tpl>',
                    '<tpl if="billingContact.address4">{billingContact.address4:stripTags}<br></tpl>',
                    '{billingContact.cityOrTown:stripTags}, {billingContact.stateOrProvince:stripTags} {billingContact.postalOrZipCode:stripTags} {billingContact.countryCode:stripTags}',
                    '<tpl if="billingContact.homePhone"><br>{billingContact.homePhone:stripTags}</tpl>',
                    '<tpl if="billingContact.mobilePhone"><br>{billingContact.mobilePhone:stripTags}</tpl>',
                    '<tpl if="billingContact.workPhone"><br>{billingContact.workPhone:stripTags}</tpl>'
                ]
            }, {
                padding: '0 50 0 0',
                tpl: [
                    '<span class="label">Email:</span><br>',
                    '<a href="mailto:{fulfillmentContact.email}">{fulfillmentContact.email}</a>'
                ]
            }, {
                flex: 1,
                html: ''
            }, {
                tpl: [
                    '<table class="section-summary">',
                        '<tr>',
                            '<td>Pending Items:</td>',
                            '<td>{itemsNotDigitallyFulfilled}</td>',
                        '</tr><tr>',
                            '<td>Fulfilled Items:</td>',
                            '<td>{itemsDigitallyFulfilled}</td></tr>',
                        '</tr><tr>',
                            '<td>Digital Items:</td>',
                            '<td>{totalDigitalItems}<td>',
                        '</tr>',
                    '</table>'
                ]
            }]
        }));
    },

    buildPendingDigitalItems: function () {
        var items = this.record.get('undeliveredDigitalItems');

        if (!items.length) return;

        this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DigitalGrid', {
            data: items,
            record: this.record
        }));
    },

    buildDeliveredDigitalItems: function () {
        Ext.each(this.record.get('digitalPackages'), function (packageData) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DigitalPackage', {
                record: this.record,
                packageData: packageData
            }));
        }, this);
    }
});