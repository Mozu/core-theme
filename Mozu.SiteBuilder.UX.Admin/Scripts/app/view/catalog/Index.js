/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.EditContainer', 'Ext.ux.form.field.BoxSelect'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var shippingAddresses,
            billingAddress,
            upperSections;

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
                groups: ['VIP', 'Top 100'],
                addresses: [{
                    id: 0,
                    isCurrentBillingAddress: true,
                    isCurrentShippingAddress: true,
                    firstName: 'Jonathan',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78732',
                    countryCode: 'USA',
                    phoneNumber: '214-653-1023'
                }, {
                    id: 1,
                    isCurrentBillingAddress: false,
                    isCurrentShippingAddress: false,
                    firstName: 'Catherine',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78732',
                    countryCode: 'USA',
                    phoneNumber: '214-653-1023'
                }, {
                    id: 2,
                    isCurrentBillingAddress: false,
                    isCurrentShippingAddress: false,
                    firstName: 'Cate',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78732',
                    countryCode: 'USA',
                    phoneNumber: '214-653-1023'
                }, {
                    id: 3,
                    isCurrentBillingAddress: false,
                    isCurrentShippingAddress: false,
                    firstName: 'Kelly',
                    lastName: 'Smith',
                    address1: '1308 Horseback Hollow',
                    address2: null,
                    address3: null,
                    cityOrTown: 'Austin',
                    stateOrProvince: 'TX',
                    postalOrZipCode: '78732',
                    countryCode: 'USA',
                    phoneNumber: '214-653-1023'
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

        // make address components from data
        shippingAddresses = this.record.get('addresses').map(function (data) {
            return Ext.create('Ext.Component', {
                cls: 'address',
                isCurrentBillingAddress: data.isCurrentBillingAddress,
                isCurrentShippingAddress: data.isCurrentShippingAddress,
                renderData: data,
                renderTpl: [
                    '<div class="name">{firstName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {stateOrProvince} {postalOrZipCode}</div>',
                    '<div class="country">{countryCode}</div>',
                    '<div class="phone">{phoneNumber}</div>'
                ]
            });
        });

        billingAddress = Ext.Array.filter(shippingAddresses, function (item) {
            return item.isCurrentBillingAddress;
        });

        Ext.Array.remove(shippingAddresses, billingAddress[0]);

        // build sections
        this.customerSettings = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Customer Settings',
            cls: Taco.baseCSSPrefix + 'catalog-customer-settings',
            items: [{
                xtype: 'textfield',
                width: 320,
                fieldLabel: 'Email Address',
                value: this.record.get('email')
            }, {
                xtype: 'boxselect',
                width: 320,
                fieldLabel: 'Groups',
                value: this.record.get('groups')
            }, {
                xtype: 'checkboxfield',
                fieldLabel: 'Marketing',
                boxLabel: 'Yes, keep me up to date on store news and specials'
            }]
        });

        this.billingAddress = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Billing Address',
            cls: Taco.baseCSSPrefix + 'catalog-billing-address',
            items: [{
                xtype: 'container',
                cls: 'addresses',
                items: billingAddress
            }]
        });

        this.customerProfile = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Customer Profile',
            cls: Taco.baseCSSPrefix + 'catalog-customer-profile',
            items: [{
                xtype: 'component',
                renderData: this.record.getData(),
                renderTpl: [
                    '<div class="total-orders"><label>Total Orders</label><h2>{totalOrders}</h2></div>',
                    '<div class="total-spent"><label>Total Spent</label><h2>{totalSpent:usMoney}</h2></div>',
                    '<div class="customer-since"><label>Customer Since</label><h2>{customerSince:date("m/d/y")}</h2></div>',
                ]
            }]
        });

        this.shippingAddresses = Ext.create('Taco.core.ux.EditContainer', {
            title: 'Shipping Addresses',
            items: [{
                xtype: 'container',
                cls: 'addresses',
                items: shippingAddresses
            }]
        });

        upperSections = Ext.create('Ext.Container', {
            cls: Taco.baseCSSPrefix + 'inline-editcontainers',
            items: [this.billingAddress, this.customerProfile, this.customerSettings]
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
            items: [upperSections, this.shippingAddresses, this.orderHistory]
        });

        this.callParent(arguments);
    }
});