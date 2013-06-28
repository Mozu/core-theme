/**
 * @class Taco.view.order.Header
 */
Ext.define('Taco.view.order.Header', {
    extend: 'Ext.Component',
    requires: [],
    
    initComponent: function () {
        this.cls = [this.cls, Taco.baseCSSPrefix + 'order-detail-header'].join(' ');

        console.log(this.renderData);
        this.renderTpl = new Ext.XTemplate(
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
                '<div>Customer since: <strong>{[this.convertDate(values.createDate)]}</strong></div>',
                '<div>Total orders: <strong>{orderCount}</strong></div>',
                '<div>Total spent: <strong>{totalSpent}</strong></div>',
//                '<div>Groups: <strong>{groups}</strong></div>',
            '</div>',
            // {createDate:date("M j, Y")}
            '<div class="taco-order-detail-header-section origin-data">',
                '{createDate:date("F j, Y | g:i a")}<!-- | IP address: {ipAddress} -->',
            '</div>', {
                convertDate: function(date) {
                    return Ext.Date.format(date, 'F j, Y, g:i a');
                }
            }
        );

        var store= Ext.bind(Taco.core.data.StoreManager.getOrCreate({
            model: 'Taco.model.CustomerAccount',
            autoLoad: true,
            proxy: {
                type: 'ajax',
                api: {
                    read: '/admin/app/customer/list?id='+this.renderData.customerId
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success',
                    messageProperty: "message"
                }
            },
            listeners: {
                load: Ext.bind(function(it, rec, successful) {

                    function merge_options(obj1, obj2) {
                        var obj3 = {};
                        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
                        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
                        return (obj3);
                    }
                    var renderDataObject = merge_options(rec[0].data, this.renderData)
                    
                    this.renderTpl.overwrite(this.el, renderDataObject);
                    
                    
                },this)
            }
        }),this);
        
        

        this.callParent(arguments);
    }
});