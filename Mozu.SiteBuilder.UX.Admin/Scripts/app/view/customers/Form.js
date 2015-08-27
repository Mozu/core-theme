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
            me = this,
            profile, contacts, orderGrid, shipingInfo, notes;

        this.title = (data.firstNameSafe ? (data.firstNameSafe + ' ' + data.lastNameSafe) : data.userName);

        this.segmentStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');

        

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'customer-editor';

        me.profile = Ext.create('Taco.view.customers.subform.Information', {
            record: this.record,
            segmentStore: this.segmentStore
        });

        me.contacts = Ext.create('Taco.view.customers.subform.Contacts', {
            record: this.record
        });

        var orderStore = this.record.getOrders();
        orderStore.sort('submittedDate', 'DESC');

        me.orderHistory = Ext.create('Taco.view.customers.subform.OrderHistory', {
            record: orderStore
        });

        me.notes = Ext.create('Taco.view.customers.subform.Notes', {
            record: orderStore
        });

        me.customerAttribute = Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: 'Customer Attributes',
            record: this.record,
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerAttributes')
        });
        me.customerAttribute.width = 960;
        this.items = [
            me.profile,
            me.contacts,
            me.storeCredit,
            me.orderHistory,
            me.customerAttribute/*,
            me.notes*/
        ];

        this.callParent(arguments);

        this.loadRecord(this.record);
    }
    
});