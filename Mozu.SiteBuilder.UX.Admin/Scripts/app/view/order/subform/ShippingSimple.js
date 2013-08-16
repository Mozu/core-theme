/**
 * @class Taco.view.order.subform.ShippingSimple
 */

Ext.define('Taco.view.order.subform.ShippingSimple', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-ordershippingsimple',
    requires: [
        'Taco.shared.view.form.Address',
        'Taco.shared.view.modal.Address'
    ],
    title: 'Shipping',

    config: {
        record: null
    },

    initComponent: function () {

        this.contact = Ext.create('Taco.model.Contact');

        this.contactsStore = Ext.create('Ext.data.Store', {
            proxy: 'memory'
        });

        this.contactsStore.add(this.contact);

        this.addresses = Ext.widget({
            xtype: 'dataview',
            cls: 'addresses',
            itemSelector: '.address',
            store: this.contactsStore,
            tpl: [
                '<tpl for=".">',
                    '<div class="address">',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                    '</div>',
                '</tpl>'
            ],
            listeners: {
                itemclick: function (view, record, item, index) {
                    
                }
            }
        });

        this.items = [
            this.addresses
        ];

        this.setTools({
            xtype: 'taco.button',
            width: 50,
            height: 30,
            text: ' ',
            menuAlign: 'tr-br',
            cls: Taco.baseCSSPrefix + 'editcontainer-menu-button',
            autoEl: {
                tag: 'a'
            },
            menu: {
                plain: true,
                items: [
                    new Ext.Action({
                        text: 'Edit Address',
                        handler: function () {
                            Ext.create('Taco.shared.view.modal.Address', {
                                record: this.contact,
                                listeners: {
                                    savesuccess: function (modal, record) {
                                        Ext.Ajax.request({
                                            url: '/admin/app/order/setshippingcontact',
                                            method: 'POST',
                                            jsonData: {
                                                orderId: this.record.getId(),
                                                contact: record.data
                                            },
                                            success: function () {
                                                console.log('success!!');
                                            },
                                            failure: function () {
                                                alert('ooops');
                                            }
                                        })
                                    },
                                    scope: this
                                }
                            });
                        },
                        scope: this
                    })
                ]
            }
        });

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