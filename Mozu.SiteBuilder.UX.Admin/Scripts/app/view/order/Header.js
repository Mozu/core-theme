/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.Component',
    requires: [],
    
    initComponent: function () {
        this.cls = [this.cls, Taco.baseCSSPrefix + 'order-detail-header'].join(' ');

        console.log(this.renderData);
        this.renderTpl = [
            '<div class="taco-order-detail-header-section order-data">',
                '<label>Order Total</label>',
                '<h2>{total:usMoney}</h2>',
                '<div class="status">{orderStatus}</div>',
            '</div>',
            '<div class="taco-order-detail-header-section customer-data">',
                '<label>Customer</label>',
//                '<h2>{[values.customer.firstName]} {[values.customer.lastName]}</h2>',
//                '<div class="company">{[values.customer.companyName]}</div>',
//                '<div class="address">{[values.customer.address]}</div>',
                '<h2>{billingContact.firstName} {billingContact.lastName}</h2>',
                '<div class="company">{billingContact.companyName}</div>',
                '<div class="address">{billingContact.address1} {billingContact.cityOrTown}, {billingContact.state} {billingContact.zipCode} {billingContact.countryCode}</div>',
            '</div>',
            '<div class="taco-order-detail-header-section history-data">',
                '<label>Customer Profile</label>',
//                '<div>Customer since: <strong>{[Ext.util.Format.date(values.customer.customerSince, "F j, Y")]}</strong></div>',
//                '<div>Total orders: <strong>{[values.customer.totalOrders]}</strong></div>',
//                '<div>Total spent: <strong>{[Ext.util.Format.usMoney(values.customer.totalSpent)]}</strong></div>',
//                '<div>Groups: <strong>{[values.customer.groups]}</strong></div>',
            '</div>',
            // {createDate:date("M j, Y")}
            '<div class="taco-order-detail-header-section origin-data">',
                '{createDate:date("F j, Y | g:i a")}<!-- | IP address: {ipAddress} -->',
            '</div>'
        ];

        this.callParent(arguments);
    }
});