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
            '<h2><a href="\#customers/edit/{customerId}\">{billingContact.firstName} {billingContact.lastName}</a></h2>',
            '<div class="company">{billingContact.companyName}</div>',
        '<tpl if="billingContact.address1">',
            '<div class="address">{billingContact.address1} {billingContact.cityOrTown}, {billingContact.state} {billingContact.zipCode} {billingContact.countryCode}</div>',
        '</tpl>',
        '</div>',
        '<div class="taco-order-detail-header-section history-data">',
            '<label>Customer Profile</label>',
            '<div>Customer since: <strong>{[Ext.util.Format.date(values.createDate)]}</strong></div>',
            '<div>Total orders: <strong>{orderCount}</strong></div>',
            '<div>Total spent: <strong>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</strong></div>',
        '</div>',
        '<div class="taco-order-detail-header-section origin-data">',
            '{createDate:date("F j, Y  g:i a")}',

            '<tpl if="ipAddress">',
                ' | IP address: {ipAddress}',
            '</tpl>',
        
            '<tpl if="channel">',
                ' | <span class="origin-data-item"> Channel: {channel.name}</span>',
            '</tpl>',
        
            '<tpl if="siteName">',
                ' | <span class="origin-data-item"> Site: {siteName}</span>',
            '</tpl>',
            
        '</div>', {
            convertDate: function(date) {
                return Ext.Date.format(date, 'F j, Y, g:i a');
            }
        }
    ],
    
    initComponent: function () {
        var me = this;
        me.cls += ' ' + Taco.baseCSSPrefix + 'order-detail-header';

        /*
        if (me.record) {
            me.data = me.record.getData();
        }
        */


        me.updateUI();
        
        // after the record is reloaded we will need to refresh the ui
        me.record.on("aftercommit", function () {
            me.onRecordChange();
        }, me);

        this.callParent(arguments);

        this.on({
            click: {
                fn: function(e) {
                    if (e.target.href && e.target.href > 2 && e.target.href.indexOf('#') > -1) {
                        Taco.core.StateManager.attemptNavigate(e.target.href.substring(e.target.href.indexOf('#') + 1));
                        e.stopEvent();
                    }
                },
                element: 'el',
                scope: this
            }
        });
    },
    
    updateUI: function () {
        var me = this;
        Taco.model.CustomerAccount.load(me.record.get('customerId'), {
            success: function (record) {
                me.customerData = record.getData();
                var data = Ext.apply({}, me.customerData, me.record.getData());
                this.update(data);
            },
            scope: me
        });
    },

    onRecordChange: function () {
        this.updateUI();
    }
});