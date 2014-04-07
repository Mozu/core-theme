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

        '<tpl if="values.loading==true">',
            '<div style="padding:20px;">loading Customer Information...</div>',
        '<tpl else>',
        '<div class="taco-order-detail-header-section order-data">',
            '<label>Order Amount</label>',
            '<h2>{total:usMoney}</h2>',
            '<div class="status">{orderStatus}</div>',
        '</div>',
        '<div class="taco-order-detail-header-section customer-data">',
            '<label>Customer</label>',
            '<h2><a href="\#customers/edit/{customerId}\">{billingContact.firstName:htmlEncode} {billingContact.lastName:htmlEncode}</a></h2>',
            '<div class="company">{billingContact.companyName:htmlEncode}</div>',
        '<tpl if="billingContact.address1">',
            '<div class="address">{billingContact.address1:htmlEncode} {billingContact.address2:htmlEncode} {billingContact.address3:htmlEncode} {billingContact.address4:htmlEncode} {billingContact.cityOrTown:htmlEncode}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode} {billingContact.countryCode}</div>',
        '</tpl>',
        '</div>',
        '<div class="taco-order-detail-header-section history-data">',
            '<label>Customer Profile</label>',
            '<div>Customer Since: <strong>{[Ext.util.Format.date(values.createDate)]}</strong></div>',
            '<div>Fulfilled Orders: <strong>{orderCount}</strong></div>',
            '<div>Lifetime Value: <strong>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</strong></div>',
        '</div>',
        '<div class="taco-order-detail-header-section origin-data">',
            'Created: {createDate:date("F j, Y  g:i a")}',
        
            '<tpl if="updateDate">',
                ' | Updated:{updateDate:date("F j, Y  g:i a")}',
            '</tpl>',
        
            '<tpl if="ipAddress">',
                ' | IP address: {ipAddress}',
            '</tpl>',
        
            '<tpl if="channelName">',
                '<span style="float:right;" class="origin-data-item"> Channel: {channelName}</span>',
            '</tpl>',
        
            
        '</div>',
        '<tpl if="customerNote">',
            '<div class="taco-order-detail-header-section customer-note  origin-data" style="float:none;border-top:1px solid #ccc;">',
                '<span class="label">Customer Note:</span> {customerNote}',
            '</div>',
        '</tpl>',
        '</tpl>',
        {
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
        // initialize the header tpl
        this.update({
            loading: true
        });

        me.updateUI();
        
        // after the record is reloaded we will need to refresh the ui
        me.mon( me.record, "aftercommit", function () {
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
            failure: function (response) {            
                console.log("Error getting customer information");                
            },
            scope: me
        });
    },

    onRecordChange: function () {
        this.updateUI();
    }
});