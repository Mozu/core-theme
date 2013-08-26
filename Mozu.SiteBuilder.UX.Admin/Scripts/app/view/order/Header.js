/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.Component',
    requires: [
        'Taco.model.CustomerAccount'
    ],
    
    title: 'Overview',

    tpl: [
        '<div class="taco-order-detail-header-section order-data">',
            '<label>Order Total</label>',
            '<h2>{total:usMoney}</h2>',
            '<div class="status">{orderStatus}</div>',
        '</div>',
        '<div class="taco-order-detail-header-section customer-data">',
            '<label>Customer</label>',
            '<h2>{billingContact.firstName} {billingContact.lastName}</h2>',
            '<div class="company">{billingContact.companyName}</div>',
        '<tpl if="billingContact.address1">',
            '<div class="address">{billingContact.address1} {billingContact.cityOrTown}, {billingContact.state} {billingContact.zipCode} {billingContact.countryCode}</div>',
        '</tpl>',
        '</div>',
        '<div class="taco-order-detail-header-section history-data">',
            '<label>Customer Profile</label>',
            '<div>Customer since: <strong>{[this.convertDate(values.createDate)]}</strong></div>',
            '<div>Total orders: <strong>{orderCount}</strong></div>',
            '<div>Total spent: <strong>{totalSpent}</strong></div>',
        '</div>',
        '<div class="taco-order-detail-header-section origin-data">',
            '{createDate:date("F j, Y | g:i a")}',
                '<tpl if="ipAddress">',
                    ' | IP address: {ipAddress}',
                '</tpl>',
        '</div>', {
            convertDate: function(date) {
                return Ext.Date.format(date, 'F j, Y, g:i a');
            }
        }
    ],
    
    initComponent: function () {
        this.cls += ' ' + Taco.baseCSSPrefix + 'order-detail-header';

        if (this.record) this.data = this.record.getData();

        Taco.model.CustomerAccount.load(this.record.get('customerId'), {
            success: function (record) {
                var data = Ext.apply({}, record.getData(), this.record.getData());
                this.update(data);
            },
            scope: this
        });

        this.callParent(arguments);
    }
});