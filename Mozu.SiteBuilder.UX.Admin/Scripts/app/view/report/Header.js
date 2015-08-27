/**
 * @class Taco.view.report.Header
 */
Ext.define('Taco.view.report.Header', {
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
            '<h2><a href="\#customers/edit/{customerId}\">{billingContact.firstName} {billingContact.lastName}</a></h2>',
            '<div class="company">{billingContact.companyName}</div>',
        '<tpl if="billingContact.address1">',
            '<div class="address">{billingContact.address1} {billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}</div>',
        '</tpl>',
        '</div>',
        '<div class="taco-order-detail-header-section history-data">',
            '<label>Customer Profile</label>',
            '<div>Customer since: <strong>{[Ext.util.Format.date(values.createDate)]}</strong></div>',
            '<div>Total orders: <strong>{orderCount}</strong></div>',
            '<div>Total spent: <strong>{[ Ext.util.Format.currency((values.totalSpent || 0), "", 2) ]}</strong></div>',
        '</div>',
        '<div class="taco-order-detail-header-section origin-data">',
            '{createDate:date("F j, Y  g:i a")}',

            '<tpl if="ipAddress">',
                ' | IP address: {ipAddress}',
            '</tpl>',

            '<tpl if="channelName">',
                ' | <span class="origin-data-item"> Channel: {channelName}</span>',
            '</tpl>',

            '<tpl if="siteName">',
                ' | <span class="origin-data-item"> Site: {siteName}</span>',
            '</tpl>',

        '</div>', {
            convertDate: function (date) {
                return Ext.Date.format(date, 'F j, Y, g:i a');
            }
        }
    ],

    initComponent: function () {
        var me = this;
        me.cls += ' ' + Taco.baseCSSPrefix + 'order-detail-header';
        this.callParent(arguments);
    },

    updateUI: function (data) {
        var me = this;
        this.update(data);
    }
});