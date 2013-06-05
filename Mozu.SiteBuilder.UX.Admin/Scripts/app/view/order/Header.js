/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.Component',
    requires: [],

    cls: Taco.baseCSSPrefix + 'order-detail-header',
    
    initComponent: function () {
        // this.renderData = {
        //     customer: {
        //         address: '1308 Horseback Hollow, Austin TX 78732, United States',
        //         companyName: 'Company ABC',
        //         customerSince: '2011-03-18T00:00:00',
        //         firstName: 'John',
        //         groups: ['VIP', 'Coupon User'],
        //         id: 'c12346',
        //         lastName: 'Smith',
        //         totalOrders: 4,
        //         totalSpent: 597.96
        //     },
        //     customerNote: 'Please take special care in packaging. Thanks!',
        //     discountTotal: 0,
        //     expirationDate: null,
        //     id: 'o124',
        //     ipAddress: '173.194.46.2',
        //     lastValidationDate: null,
        //     orderNumber: 107363,
        //     orderStatus: 'Processing Order',
        //     paymentStatus: '',
        //     shippingStatus: '',
        //     shippingTotal: 0,
        //     subTotal: null,
        //     taxTotal: 0,
        //     total: 229.48
        // };
        console.log(this.renderData);

        this.renderTpl = [
            '<div class="taco-order-detail-header-section">',
                '<label>Order Total</label>',
                '<h2>{total:usMoney}</h2>',
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
                '<div>Customer since: <strong>{[Ext.util.Format.date(values.customer.customerSince, "F j, Y")]}</strong></div>',
                '<div>Total orders: <strong>{[values.customer.totalOrders]}</strong></div>',
                '<div>Total spent: <strong>{[Ext.util.Format.usMoney(values.customer.totalSpent)]}</strong></div>',
                '<div>Groups: <strong>{[this.join(values.customer.groups, ", ")]}</strong></div>',
            '</div>',
            {
                join: function (values, separator) { return values.join(separator); }
            }
        ];

        this.callParent(arguments);
    }
});