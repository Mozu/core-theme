/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.EditContainer'],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        this.mono = Ext.create('Ext.Component', {
            xtype: 'component',
            cls: Taco.baseCSSPrefix + 'order-detail-header',
            renderData: {
                customer: {
                    address: '1308 Horseback Hollow, Austin TX 78732, United States',
                    companyName: 'Company ABC',
                    customerSince: '2011-03-18T00:00:00',
                    firstName: 'John',
                    groups: ['VIP', 'Coupon User'],
                    id: 'c12346',
                    lastName: 'Smith',
                    totalOrders: 4,
                    totalSpent: 597.96
                },
                customerNote: 'Please take special care in packaging. Thanks!',
                discountTotal: 0,
                expirationDate: null,
                id: 'o124',
                ipAddress: '173.194.46.2',
                lastValidationDate: null,
                orderNumber: 107363,
                orderStatus: 'Processing Order',
                paymentStatus: '',
                shippingStatus: '',
                shippingTotal: 0,
                subTotal: null,
                taxTotal: 0,
                total: 229.48
            },
            renderTpl: [
                '<div class="taco-order-detail-header-section">',
                    '<label>Order Total</label>',
                    '<h2>{total}</h2>',
                    '<div class="status">{orderStatus}</div>',
                '</div>',
                '<div class="taco-order-detail-header-section">',
                    '<label>Customer</label>',
                    '<h2>{[values.customer.firstName]} {[values.customer.lastName]}</h2>',
                    '<div class="company">{[values.customer.companyName]}</div>',
                    '<div class="address">{[values.customer.address]}</div>',
                '</div>',
                '<div class="taco-order-detail-header-section">',
                    '<label>Customer Profile</label>',
                    '<div>Customer since: <strong>{[values.customer.customerSince]}</strong></div>',
                    '<div>Total orders: <strong>{[values.customer.totalOrders]}</strong></div>',
                    '<div>Total spent: <strong>{[values.customer.totalSpent]}</strong></div>',
                    '<div>Groups: <strong>{[this.join(values.customer.groups, ", ")]}</strong></div>',
                '</div>',
                {
                    join: function (values, separator) { return values.join(separator); }
                }
            ]
        });

        this.thing = Ext.create('Taco.core.ux.EditContainer', {
            height: 400,
            width: 1000,
            title: 'Hello World',
            menu: {
                plain: true,
                shadow: true,
                items: [{
                    text: 'lorem',
                    handler: function () {
                        var ct = this.up('[isEditContainer]');
                        ct.
                        ct.toggleActions();
                    }
                }, {
                    text: 'ipsum'
                }]
            },
            tools: [{
                xtype: 'button',
                text: ' ',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Edit',
                        handler: function () {
                            var ct = this.up('[isEditContainer]');
                            ct.toggleActions();
                        }
                    }]
                }
            }],
            actions: [{
                xtype: 'taco.button',
                text: 'Cancel',
                handler: function () {
                    var ct = this.up('[isEditContainer]');
                    ct.toggleActions();
                }
            }],
            items: [{
                xtype: 'component',
                html: 'what'
            }]
        });

        Ext.apply(this.body, {
            items: [this.mono]
        });

        this.callParent(arguments);
    }
});