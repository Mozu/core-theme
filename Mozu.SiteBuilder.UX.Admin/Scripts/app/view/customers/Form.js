/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.CustomerGroups', 'Taco.view.order.Index', 'Taco.shared.view.form.ExtensibleAttribute'],
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
        this.tagStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerGroups');

        this.tagStore.on('add', function (store, records) {
            console.log('tagstoreadd', records);
        });

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'customer-editor';
        
        me.profile = Ext.create('Taco.view.customers.subform.Information', {
            record: this.record,
            tagStore: this.tagStore
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
            me.orderHistory,
            me.customerAttribute,
            me.notes
        ];

        this.callParent(arguments);

        this.loadRecord(this.record);
    },
    addSaveTasks: function (tasks, updateRecord, saveRecord) {
        var me = this,
            groups = this.findField('groups'),
            groupValue = groups.getValue(),
            updateTask,
            newTags = [];

        this.callParent(arguments);

        if (groups.isDirty()) {
            Ext.each(groupValue, function (val) {
                if (Ext.isString(val)) {
                    me.tagStore.add({ Value: val });
                }
            });

            if (me.tagStore.isDirty()) {
                
                


                tasks.add({
                    store: me.tagStore,
                    dependencyForFilter: function (task) {
                        return task.saveRecord == me.record;
                    }
                });

                tasks.add({
                    fn: function (gfutasks) {

                        Ext.Array.each(groupValue, function (val, index) {
                            var gRecord;
                            if (Ext.isString(val)) {
                                gRecord = me.tagStore.findRecord('Value', val);
                                if (gRecord) {
                                    groupValue[index] = gRecord.getId();
                                }

                            }
                        });

                        groups.setValue(groupValue);
                        gfutasks.callback();

                    },
                    dependencyFilter:function (task) {
                        return task.store == me.tagStore
                    }
                });
            }

        }
        //tasks.add({
        //    store: me.record.getContacts(),
        //    key: 'contactStore'
        //});


        return tasks;
    }
});