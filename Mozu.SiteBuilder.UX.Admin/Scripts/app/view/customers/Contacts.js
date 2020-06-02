Ext.define('Taco.view.customers.Contacts', {
    extend: 'Ext.Container',
    requires: [
        'Taco.shared.view.modal.Address'
    ],
    border: 1,

    cls: 'taco-customer-contacts',

    order: null,

    initComponent: function () {

        this.addressContainer = Ext.widget({
            xtype: 'container',
            items: []
        });

        this.buildAddresses();

        this.items = [this.addressContainer];

        this.callParent(arguments);
    },

    sortContacts: function () {
        var fnValue = function (a) {
            if (a.isFromOrder) return 0;
            if (a.isPrimaryBilling) return 1;
            if (a.isPrimaryShipping) return 2;
            return 3;
        };

        Ext.Array.sort(this.contacts, function (a, b) {
            return fnValue(a) - fnValue(b);
        });
    },

    buildAddresses: function () {
        var fulfillmentContact = this.order ? this.order.get('fulfillmentContact') : {},
            fulfillmentContactJson = Ext.encode(fulfillmentContact),
            billingContact = this.order ? this.order.get('billingContact') : {},
            billingContactJson = Ext.encode(billingContact),
            oneBillingChecked = false,
            oneShippingChecked = false;


        this.loadContacts();

        this.sortContacts();

        this.addressContainer.removeAll();

        Ext.each(this.contacts, function (contact) {
            var billingChecked = contact.isOrderBilling || billingContactJson === Ext.encode(contact),
                shippingChecked = contact.isOrderFullfilment || fulfillmentContactJson === Ext.encode(contact);

            if (billingChecked) oneBillingChecked = true;
            if (shippingChecked) oneShippingChecked = true;

            this.addressContainer.add({

                xtype: 'container',
                width: 280,
                contact: contact,
                contactId: contact.id,
                isFromOrder: contact.isFromOrder || false,
                style: {
                    display: 'inline-block',
                    verticalAlign: 'top'
                },
                cls: 'address',
                border: 1,
                itemType: 'addressContainer',
                margin: '0 10 20 0',
                items: [{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [{
                        xtype: 'component',
                        flex: 1,
                        cls: 'label',
                        html: contact.isFromOrder ? Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.order_contact : Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.customer_contact
                    }, {
                        xtype: 'button',
                        ui: 'link',
                        scale: 'medium',
                        padding: '0 0 0 0',
                        text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.edit,
                        itemId: 'editButton',
                        handler: function () {
                            this.editContact(contact);
                        },
                        scope: this
                    }, {
                        xtype: 'button',
                        padding: '0 0 0 5',
                        ui: 'link',
                        scale: 'medium',
                            text: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.delete_button_text,
                        itemId: 'deleteButton',
                        hidden: contact.isFromOrder,
                        handler: function () {
                            this.deleteContact(contact);
                        },
                        scope: this
                    }]
                }, {
                    xtype: 'component',
                    margin: '8 0 0 0',
                    tpl: [
                        '<div data-handle="contact-{id}" data-contact-type="<tpl if="isFromOrder">order<tplelse>customer</tpl>">',

                        '<tpl if="isPrimaryBilling"><div class="label-light">Default Billing</div></tpl>',

                        '<tpl if="isPrimaryShipping"><div class="label-light">Default Shipping</div></tpl>',

                        '<div class="name">{firstName:htmlEncode}<tpl if="middleName"> {middleName:htmlEncode}</tpl> {lastName:htmlEncode}</div>',

                        '<tpl if="companyOrOrganization"><div>{companyOrOrganization:htmlEncode}</div></tpl>',

                        '<div data-handle="contact-address1">{address1:htmlEncode}</div>',

                        '<tpl if="address2"><div>{address2:htmlEncode}</div></tpl>',

                        '<tpl if="address3"><div>{address3:htmlEncode}</div></tpl>',

                        '<tpl if="address4"><div>{address4:htmlEncode}</div></tpl>',

                        '<div>{cityOrTown:htmlEncode}, {stateOrProvince:htmlEncode} {postalOrZipCode:htmlEncode} {countryCode:htmlEncode}</div>',

                        '<table class="phone-numbers">',

                            '<tpl if="homePhone"><tr><td>Home:</td><td>{homePhone:htmlEncode}</td></tr></tpl>',

                            '<tpl if="mobilePhone"><tr><td>Mobile:</td><td>{mobilePhone:htmlEncode}</td></tr></tpl>',

                            '<tpl if="workPhone"><tr><td>Work:</td><td>{workPhone:htmlEncode}</td></tr></tpl>',

                        '</table>',

                        '</div>'
                    ],
                    data: contact
                }, {
                    xtype: 'radiofield',
                    name: 'customerShipToAddress',
                    inputValue: contact,
                    boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.ship_to_this_addr,
                    checked: shippingChecked,
                    margin: '8 0 0 0',
                    hidden: !this.order
                }, {
                    xtype: 'radiofield',
                    name: 'customerBillToAddress',
                    inputValue: contact,
                    boxLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.bill_to_this_addr,                    
                    //disabled:(this.order.get('orderStatus') !== 'Pending'),
                    checked: billingChecked,
                    hidden: !this.order || (this.order.get('orderStatus') !== 'Pending')
                }]
            });
        }, this);


        if (!this.contacts.length) {
            this.addressContainer.add({
                xtype: 'component',
                html: '<div class="no-address">'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.no_contacts_for_user + '<br><br>'+Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.add_address_below+'</div>'
            });
            return;
        }

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
        var isFirstContact = this.contacts.length === 0;
        this.editContact({
            id: Ext.id(),
            isNewContact: true,
            isBilling: true,
            isShipping: true,
            isPrimaryShipping: isFirstContact,
            isPrimaryBilling: isFirstContact,
            firstName: this.record.get('firstName'),
            lastName: this.record.get('lastName'),
            email: this.record.get('emailAddress')
        });
    },

    editContact: function (contact) {
        Ext.create('Taco.shared.view.modal.Address', {
            record: Ext.create('Taco.model.Contact', contact),
            showDefaultOptions: true,
            listeners: {
                savesuccess: function (form, newContact) {
                    var contacts = Ext.Array.clone(this.record.get('contacts')),
                        index = -1;

                    Ext.each(contacts, function (c, i) {
                        if (Ext.encode(c) === Ext.encode(contact)) {
                            index = i;
                            return false;
                        }
                    });

                    if (newContact.get('isPrimaryBilling')) {
                        this.clearContactDefaults(contacts, 'isPrimaryBilling');
                    }

                    if (newContact.get('isPrimaryShipping')) {
                        this.clearContactDefaults(contacts, 'isPrimaryShipping');
                    }

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

    clearContactDefaults: function (contacts, field) {
        Ext.each(contacts, function (contact) {
            if (contact[field]) contact[field] = false;
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
                Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.delete_contact_warning,
                '<div style="padding: 20px;" data-handle="contact-{id}">',

                '{firstName:htmlEncode} {lastName:htmlEncode}<br>',

                '<span data-handle="contact-address1">{address1:htmlEncode}</span><br>',

                '<tpl if="address2">{address2:htmlEncode}<br></tpl>',

                '{cityOrTown:htmlEncode}, {stateOrProvince:htmlEncode} {postalOrZipCode:htmlEncode} {countryCode:htmlEncode}<br>',

                '<tpl if="homePhone">{homePhone:htmlEncode}<br></tpl>',

                '<tpl if="mobilePhone">{mobilePhone:htmlEncode}<br></tpl>',

                '<tpl if="workPhone">{workPhone:htmlEncode}<br></tpl>',

                '</div>'
            );

        Taco.MessageBox.show({
            title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.confirm_deletion,
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