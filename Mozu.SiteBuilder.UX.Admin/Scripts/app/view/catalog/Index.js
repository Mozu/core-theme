/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.EditContainer', 'Ext.ux.form.field.BoxSelect', 'Taco.view.customers.AddressModal', 'Taco.model.Contact'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var shippingAddresses,
            billingAddress,
            upperSections,
            editAddress;

        // set up data
        this.store = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'id',
                type: 'int'
            }, {
                name: 'firstName',
                type: 'string'
            }, {
                name: 'lastName',
                type: 'string'
            }, {
                name: 'addresses',
                type: 'auto'
            }, {
                name: 'acceptsMarketing',
                type: 'boolean'
            }, {
                name: 'email',
                type: 'string'
            }, {
                name: 'groups',
                type: 'auto'
            }, {
                name: 'customerSince',
                type: 'date'
            }, {
                name: 'totalOrders',
                type: 'int'
            }, {
                name: 'totalSpent',
                type: 'float'
            }, {
                name: 'orderHistory',
                type: 'auto'
            }],
            data: [{
                id: 0,
                firstName: 'John',
                lastName: 'Smith',
                acceptsMarketing: true,
                customerSince: '2011-03-18T00:00:00',
                totalOrders: 4,
                totalSpent: 597.96,
                email: 'john.smith@example.com',
                groups: 'VIP, Top 100',
                addresses: [{
                    id: 0,
                    firstName: 'Jonathan',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    state: 'TX',
                    zipCode: '78732',
                    countryCode: 'USA',
                    homePhone: '214-653-1023'
                }, {
                    id: 1,
                    firstName: 'Catherine',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    state: 'TX',
                    zipCode: '78732',
                    countryCode: 'USA',
                    homePhone: '214-653-1023'
                }, {
                    id: 2,
                    firstName: 'Cate',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    state: 'TX',
                    zipCode: '78732',
                    countryCode: 'USA',
                    homePhone: '214-653-1023'
                }, {
                    id: 3,
                    firstName: 'Kelly',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    state: 'TX',
                    zipCode: '78732',
                    countryCode: 'USA',
                    homePhone: '214-653-1023'
                }],
                orderHistory: [{
                    id: 235,
                    date: '2012-02-12T00:00:00',
                    amount: 102.99,
                    status: 'Paid'
                }, {
                    id: 187,
                    date: '2012-01-23T00:00:00',
                    amount: 295.99,
                    status: 'Completed'
                }, {
                    id: 125,
                    date: '2011-10-11T00:00:00',
                    amount: 118.99,
                    status: 'Completed'
                }, {
                    id: 69,
                    date: '2011-08-22T00:00:00',
                    amount: 79.99,
                    status: 'Completed'
                }]
            }]
        });

        this.record = this.store.first();

        this.shippingAddressStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.Contact',
            data: this.record.get('addresses')
        });

        this.orderHistoryStore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'id',
                type: 'int'
            }, {
                name: 'date',
                type: 'date'
            }, {
                name: 'amount',
                type: 'float',
            }, {
                name: 'status',
                type: 'string'
            }],
            data: this.record.get('orderHistory')
        });

        shippingAddresses = Ext.create('Ext.view.View', {
            cls: 'addresses',
            itemSelector: '.address',
            store: this.shippingAddressStore,
            tpl: [
                '<tpl for="."><div class="address">',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{countryCode}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                '</div></tpl>'
            ]
        });

        // build sections
        this.customerProfile = Ext.create('Taco.core.ux.EditContainer', {
            width: 960,
            manageHeight: false,
            title: 'Customer Profile',
            cls: Taco.baseCSSPrefix + 'catalog-customer-profile',
            items: [{
                xtype: 'formpanel',
                width: 320,
                items: [{
                    xtype: 'textfield',
                    width: 320,
                    fieldLabel: 'Email Address',
                    value: this.record.get('email')
                }, {
                    xtype: 'boxselect',
                    width: 320,
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: false,
                    createNewOnEnter: true,
                    queryMode: 'local',
                    fieldLabel: 'Groups',
                    value: ['VIP', 'Top 100'],
                    store: [],
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.setValue(cmp.getValue());
                            cmp.resetOriginalValue();
                        }
                    }
                }, {
                    xtype: 'checkboxfield',
                    fieldLabel: 'Marketing',
                    boxLabel: 'Yes, keep me up to date on store news and specials',
                    checked: this.record.get('acceptsMarketing')
                }]
            }, {
                xtype: 'component',
                width: 320,
                cls: 'customer-history',
                renderData: this.record.getData(),
                renderTpl: [
                    '<div class="total-orders"><label>Total Orders</label><h2>{totalOrders}</h2></div>',
                    '<div class="total-spent"><label>Total Spent</label><h2>{totalSpent:usMoney}</h2></div>',
                    '<div class="customer-since"><label>Customer Since</label><h2>{customerSince:date("m/d/y")}</h2></div>',
                ]
            }]
        });

        this.shippingAddresses = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Billing & Shipping Addresses',
            items: [shippingAddresses]
        });

        this.orderHistory = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Order History',
            items: [{
                xtype: 'grid',
                store: this.orderHistoryStore,
                columns: [{
                    dataIndex: 'id',
                    text: 'Order ID',
                    flex: 1
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'date',
                    text: 'Order Date',
                    format: 'm/d/y',
                    flex: 1
                }, {
                    dataIndex: 'amount',
                    text: 'Order Amount',
                    flex: 1
                }, {
                    dataIndex: 'status',
                    text: 'Order Status',
                    flex: 1
                }]
            }]
        });

        // put it all together
        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: { type: 'auto' },
            items: [this.customerProfile, this.shippingAddresses, this.orderHistory]
        });

        this.callParent(arguments);

        shippingAddresses.on({
            itemclick: function (view, record, item, index, e) {
                var modal;

                if (e.getTarget('.edit', 10)) {
                    modal = Ext.create('Taco.view.customers.AddressModal', {
                        record: record
                    });
                }
            }
        });
    }
});