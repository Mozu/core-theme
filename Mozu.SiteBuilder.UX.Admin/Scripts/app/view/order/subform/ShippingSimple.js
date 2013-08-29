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

        this.shippingMethodsStore = this.record.getShippingMethods();

        this.contactsStore.add(this.contact);

        this.addresses = Ext.widget({
            xtype: 'dataview',
            cls: 'addresses',
            itemSelector: '.address',
            store: this.contactsStore,
            tpl: [
                '<tpl for=".">',
                    '<div class="address">',
                    '<tpl if="firstName">',
                        '<div class="name">{firstName} {middleName} {lastName}</div>',
                        '<div class="address-line-1">{address1}</div>',
                        '<div class="address-line-2">{address2}</div>',
                        '<div class="address-line-3">{address3}</div>',
                        '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                        '<div class="country">{email}</div>',
                        '<div class="phone">{homePhone}</div>',
                    '<tplelse>',
                        '<div class="no-address">No Address<br>Click to add one.</div>',
                    '</tpl>',
                    '</div>',
                '</tpl>'
            ],
            listeners: {
                itemclick: function (view, record, item, index, e) {
                    var el = Ext.get(e.getTarget());
                    
                    if (el.hasCls('no-address')) {
                        this.launchEditor();
                    }
                },
                scope: this
            }
        });

        this.shippingMethods = Ext.widget({
            xtype: 'selectfield',
            width: 200,
            fieldLabel: 'Shipping Methods',
            valueField: 'ShippingMethodCode',
            displayField: 'ShippingMethodName',
            store: this.shippingMethodsStore,
            listConfig: {
                getInnerTpl: function () {
                    return '{ShippingMethodName} {Price:currency}';
                }
            },
            listeners: {
                select: function () {
                    this.setShippingInfo();
                },
                scope: this
            }
        });

        this.items = [
            this.addresses,
            this.shippingMethods
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
                        handler: this.launchEditor,
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

    launchEditor: function () {
        Ext.create('Taco.shared.view.modal.Address', {
            record: this.contact,
            listeners: {
                savesuccess: function (modal, record) {
                    this.contactData = record.data;
                    this.setShippingInfo();
                    this.fireEvent('orderchange');
                },
                scope: this
            }
        });
    },

    setShippingInfo: function () {
        Ext.Ajax.request({
            url: '/admin/app/order/setshippinginfo',
            method: 'POST',
            jsonData: {
                orderId: this.record.getId(),
                contact: this.contactData,
                shippingMethodCode: this.shippingMethods.getValue()
            },
            success: function () {
                console.log('success!!');
                this.loadShippingMethods();
            },
            failure: function () {
                alert('ooops');
            },
            scope: this
        });
    },

    loadShippingMethods: function () {
        var store = this.record.getShippingMethods();

        this.shippingMethodsStore.load({
            callback: function () {
                //is.shippingMethodsStore
                console.log('store', this.shippingMethodsStore.count());
            },
            scope: this
        });
    },

    isValid: function () {
        return this.hasShippingContact();
    },

    hasShippingContact: function () {
        return !!this.contact.get('firstName');
    }
});