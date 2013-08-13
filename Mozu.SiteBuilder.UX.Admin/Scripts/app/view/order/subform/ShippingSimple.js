/**
 * @class Taco.view.order.subform.ShippingSimple
 */

Ext.define('Taco.view.order.subform.ShippingSimple', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.shared.view.form.Address',
        'Taco.shared.view.modal.Address'
    ],
    title: 'Shipping',

    config: {
        record: null
    },

    initComponent: function () {

        this.addresses = Ext.widget({
            xtype: 'dataview',
            cls: 'addresses',
            itemSelector: '.address',
            tpl: [
                '<tpl for="."><div class="address">',
                '<div class="name">{firstName} {middleName} {lastName}</div>',
                '<div class="address-line-1">{address1}</div>',
                '<div class="address-line-2">{address2}</div>',
                '<div class="address-line-3">{address3}</div>',
                '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                '<div class="country">{email}</div>',
                '<div class="phone">{homePhone}</div>',
                '<div class="edit">E</div>',
                '</div></tpl>'
            ],
            listeners: {
                itemclick: function (view, record, item, index) {
                    if (!e.getTarget('.edit')) return;

                    Ext.create('Taco.shared.view.modal.Address', {
                        record: record
                    });
                }
            }
        });

        this.addressForm = Ext.widget({
            xtype: 'taco-addressform'
        });

        this.items = [
            this.addresses,
            this.addressForm
        ];

        this.callParent(arguments);
    },

    setCustomer: function (customer) {
        this.record = customer;
        this.contacts = this.record.getConacts();

        this.addresses.bindStore(this.contacts);
    },

    checkContactState: function () {

    }
});