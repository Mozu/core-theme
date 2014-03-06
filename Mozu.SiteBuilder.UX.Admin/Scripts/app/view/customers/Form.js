/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.CustomerSegments',
        'Taco.view.order.Index',
        'Taco.shared.view.form.ExtensibleAttribute',
        'Taco.view.customers.subform.Information',
        'Taco.view.customers.subform.BillingInformation',
        'Taco.view.customers.subform.ShippingInformation',
        'Taco.view.customers.subform.OrderHistory',
        'Taco.view.customers.subform.Notes'],
    // enableStoreSyncTasks:true,
    initComponent: function () {
        var data = this.record.getData(),
            contactsStore = this.record.getContacts(),
            me = this,
            profile, contacts, orderGrid, shipingInfo, notes;

        this.title = [
            data.primaryFirstName,
            data.primaryMiddleName,
            data.primaryLastName
        ].join(' ');

        this.store = this.record.getContacts();
        this.segmentStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'customer-editor';

        me.profile = Ext.create('Taco.view.customers.subform.Information', {
            record: this.record,
            segmentStore: this.segmentStore
        });

        me.billingInformation = Ext.create('Taco.view.customers.subform.BillingInformation', {
            record: contactsStore
        });

        me.shippingInformation = Ext.create('Taco.view.customers.subform.ShippingInformation', {
            record: contactsStore
        });

        var orders = this.record.getOrders();
        orders.load();
        me.orderHistory = Ext.create('Taco.view.customers.subform.OrderHistory', {
            record: orders
        });

        me.notes = Ext.create('Taco.view.customers.subform.Notes', {
            record: orders
        });

        me.customerAttribute = Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: 'Customer Attributes',
            record: this.record,
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerAttributes')
        });
        me.customerAttribute.width = 960;
        this.items = [
            me.profile,
            me.billingInformation,
            me.shippingInformation,
            me.storeCredit,
            me.orderHistory,
            me.customerAttribute/*,
            me.notes*/
        ];

        this.callParent(arguments);

        this.loadRecord(this.record);
    }
    
});