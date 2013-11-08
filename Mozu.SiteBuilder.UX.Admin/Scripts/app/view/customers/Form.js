/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.CustomerTags', 'Taco.view.order.Index','Taco.view.customers.subform.CustomerAttribute'],
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
        this.tagStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerTags');

        this.tagStore.on('add', function (store, records) {
            console.log('tagstoreadd', records);
        });

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'customer-editor';
        
        me.profile = Ext.create('Taco.view.customers.subform.Information', {
            record: data,
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

        me.storeCredit = Ext.create('Taco.view.customers.subform.StoreCredit', {
            record: data,
            tagStore: this.tagStore
        });

        me.customerAttribute = Ext.create('Taco.view.customers.subform.CustomerAttribute', {
            record: this.record
        });

        this.items = [
            me.profile,
            me.billingInformation,
            me.shippingInformation,
            me.storeCredit,
            me.orderHistory,
            me.customerAttribute,
            me.notes
        ];

        this.callParent(arguments);

        console.log(contactsStore);

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
                
                updateTask = tasks.tasks.getByKey('update-record');
                updateTask.dependencies = ['groupFieldUpdate'];


                tasks.add({
                    store: me.tagStore,
                    key: 'tagstore'
                });

                tasks.add({
                    key: 'groupFieldUpdate',
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
                    dependencies: [
                        'tagstore'
                    ]
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