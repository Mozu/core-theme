Ext.define('Taco.view.customers.Contacts', {
    extend: 'Ext.Container',
    requires: [
        'Taco.shared.view.modal.Address'
    ],
    border: 1,
    padding: 5,
    margin: 20,
    width: 520,

    order: null,

    initComponent: function () {

        this.addressContainer = Ext.widget({
            xtype: 'container'
        });

        this.buildAddresses();

        this.items = [this.addressContainer];

        this.callParent(arguments);
    },

    buildAddresses: function () {
        var fulfillmentContact = this.order ? this.order.get('fulfillmentContact') : {},
            fulfillmentContactJson = Ext.encode(fulfillmentContact),
            billingContact = this.order ? this.order.get('billingContact') : {},
            billingContactJson = Ext.encode(billingContact),
            oneBillingChecked = false,
            oneShippingChecked = false;

        this.loadContacts();

        this.addressContainer.removeAll();

        Ext.each(this.contacts, function (contact) {
            var billingChecked = contact.isOrderBilling || billingContactJson === Ext.encode(contact),
                shippingChecked = contact.isOrderFullfilment || fulfillmentContactJson === Ext.encode(contact);

            if (billingChecked) oneBillingChecked = true;
            if (shippingChecked) oneShippingChecked = true;

            this.addressContainer.add({

                xtype: 'container',
                width: 250,
                contact: contact,
                isFromOrder: contact.isFromOrder || false,
                style: {
                    display: 'inline-block',
                    verticalAlign: 'top'
                },
                padding: 10,
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [{
                        xtype: 'component',
                        flex: 1,
                        html: contact.isFromOrder ? 'Order Contact' : 'Customer Contact',
                        hidden: !this.order
                    }, {
                        xtype: 'button',
                        ui: 'link',
                        padding: '0 0 0 5',
                        text: 'Edit',
                        itemId: 'editButton',
                        handler: function () {
                            this.editContact(contact);
                        },
                        scope: this
                    }, {
                        xtype: 'button',
                        padding: '0 0 0 5',
                        ui: 'link',
                        text: 'Delete',
                        itemId: 'deleteButton',
                        hidden: contact.isFromOrder,
                        handler: function () {
                            this.deleteContact(contact);
                        },
                        scope: this
                    }]
                }, {
                    xtype: 'component',
                    tpl: [
                        '<div data-handle="contact-{id}" data-contact-type="', '<tpl if="isFromOrder">order<tplelse>customer</tpl>', '">',

                        '{firstName}<tpl if="middleName"> {middleName}</tpl> {lastName}<br>',

                        '<span data-handle="contact-address1">{address1}</span><br>',

                        '<tpl if="address2">{address2}<br></tpl>',

                        '<tpl if="address3">{address3}<br></tpl>',

                        '<tpl if="address4">{address4}<br></tpl>',

                        '{cityOrTown}, {stateOrProvince} {postalOrZipCode} {countryCode}<br>',

                        '<tpl if="homePhone">{homePhone}<br></tpl>',

                        '<tpl if="mobilePhone">{mobilePhone}<br></tpl>',

                        '<tpl if="workPhone">{workPhone}<br></tpl>',

                        '</div>'
                    ],
                    data: contact
                }, {
                    xtype: 'radiofield',
                    name: 'customerShipToAddress',
                    inputValue: contact,
                    boxLabel: 'Ship to this address',
                    checked: shippingChecked,
                    hidden: !this.order
                }, {
                    xtype: 'radiofield',
                    name: 'customerBillToAddress',
                    inputValue: contact,
                    boxLabel: 'Bill to this address',
                    checked: billingChecked,
                    hidden: !this.order
                }]
            });
        }, this);

        if (!this.contacts.length) return;

        if (!oneBillingChecked) this.addressContainer.down('[name="customerBillToAddress"]').setValue(true);

        if (!oneShippingChecked) this.addressContainer.down('[name="customerShipToAddress"]').setValue(true);
    },

    getSelection: function () {
        var ret = {};

        Ext.each(this.query('[name="customerShipToAddress"]'), function (radio) {
            if (radio.getValue()) {
                ret.customerShipToAddress = radio.inputValue;
                return false;
            }
        });

        Ext.each(this.query('[name="customerBillToAddress"]'), function (radio) {
            if (radio.getValue()) {
                ret.customerBillToAddress = radio.inputValue;
                return false;
            }
        });

        return ret;
    },

    loadContacts: function () {
        var billingContact,
            fulfillmentContact,
            foundBilling,
            foundFulfillment;

        this.contacts = [];

        if (this.order) {

            billingContact = Ext.clone(this.order.get('billingContact'));
            fulfillmentContact = Ext.clone(this.order.get('fulfillmentContact'));

            if (billingContact && billingContact.address1) {
                foundBilling = Ext.Array.findBy(this.record.get('contacts'), function (contact) {
                    return this.contactsMatch(contact, billingContact);
                }, this);

                if (!foundBilling) {
                    billingContact.isFromOrder = true;
                    billingContact.isOrderBilling = true;
                    Ext.Array.push(this.contacts, billingContact);
                }
            }

            if (fulfillmentContact && fulfillmentContact.address1) {
                foundFulfillment = Ext.Array.findBy(this.record.get('contacts'), function (contact) {
                    return this.contactsMatch(contact, fulfillmentContact);
                }, this);

                if (!foundFulfillment) {
                    fulfillmentContact.isFromOrder = true;
                    fulfillmentContact.isOrderFullfilment = true;

                    if (!this.contactsMatch(fulfillmentContact, billingContact)) Ext.Array.push(this.contacts, fulfillmentContact);
                }
            }
        }

        Ext.Array.push(this.contacts, this.record.get('contacts'));
    },

    createNewContact: function () {
        this.editContact({
            isNewContact: true
        });
    },

    editContact: function (contact) {
        Ext.create('Taco.shared.view.modal.Address', {
            record: Ext.create('Taco.model.Contact', contact),
            showDefaultOptions: true,
            listeners: {
                savesuccess: function (form, newContact) {
                    var contacts = Ext.Array.clone(this.record.get('contacts')),
                        index = Ext.Array.indexOf(contacts, contact);

                    if (contact.isNewContact) {
                        this.record.set('contacts', Ext.Array.insert(contacts, 0, [newContact.getData()]));
                    } else if (index >= 0) {
                        this.record.set('contacts', Ext.Array.replace(contacts, index, 1, [newContact.getData()]));
                    } else {
                        if (!contact.isFromOrder) return;

                        this.order.set(contact.isOrderFullfilment ? 'fulfillmentContact' : 'billingContact', newContact.getData());

                        this.record.set('contacts', Ext.Array.insert(contacts, 0, [newContact.getData()]));
                    }

                    this.buildAddresses();
                },
                scope: this
            }
        });
    },

    contactsMatch: function (c1, c2) {
        var parameters = [
                'firstName',
                'lastName',
                'address1',
                'address2',
                'address3',
                'address4',
                'cityOrTown',
                'stateOrProvince',
                'postalOrZipCode',
                'countryCode',
                'homePhone',
                'mobilePhone',
                'workPhone',
                'email',
                'companyOrOrganization',
                'addressType'
            ],
            ret = true;

        Ext.each(parameters, function (param) {
            if (c1[param] !== c2[param]) {
                ret = false;
                return false;
            }
        });

        return ret;
    },

    deleteContact: function (contact) {
        var me = this,
            tpl = new Ext.XTemplate(
                'Are you sure you want to Delete this contact?',
                '<div style="padding: 20px;" data-handle="contact-{id}">',

                '{firstName} {lastName}<br>',

                '<span data-handle="contact-address1">{address1}</span><br>',

                '<tpl if="address2">{address2}<br></tpl>',

                '{cityOrTown}, {stateOrProvince} {postalOrZipCode} {countryCode}<br>',

                '<tpl if="homePhone">{homePhone}<br></tpl>',

                '<tpl if="mobilePhone">{mobilePhone}<br></tpl>',

                '<tpl if="workPhone">{workPhone}<br></tpl>',

                '</div>'
            );

        Taco.MessageBox.show({
            title: 'Confirm Deletion',
            msg: tpl.apply(contact),
            buttons: Ext.Msg.OKCANCEL,

            fn: function (buttonId) {
                var contacts;

                if (buttonId !== 'ok') return;

                contacts = Ext.Array.clone(me.record.get('contacts'));

                me.record.set('contacts', Ext.Array.remove(contacts, contact));

                me.buildAddresses();
            }
        });
    }
});