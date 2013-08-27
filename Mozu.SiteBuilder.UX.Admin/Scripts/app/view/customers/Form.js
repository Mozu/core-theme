/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.CustomerTags', 'Taco.view.order.Index'],
    // enableStoreSyncTasks:true,
    initComponent: function () {
        var data = this.record.getData(),
            contactsStore = this.record.getContacts(),
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
        console.log(data);
        profile = Ext.create('Ext.panel.Panel', {
            width: 960,
            ui: 'subform',
            bodyPadding: '19 0',
            margin: '0 0 20 0',
            title: 'Shopper ID',
            cls: Taco.baseCSSPrefix + 'customer-profile',
            items: [{
                    xtype: 'container',
                    width: 340,
                    cls: 'customer-settings',
                    items: [{
                            xtype: 'textfield',
                            width: 320,
                            readOnly: true,
                            name: 'userId',
                            fieldLabel: 'User ID'
                        }, {
                            xtype: 'checkboxfield',
                            name: 'acceptsMarketing',
                            //fieldLabel: 'Marketing',
                            boxLabel: 'Yes, keep me up to date on store news and specials'
                        }]
            }, {
                xtype: 'container',
                width: 320,
                cls: 'customer-settings',
                items: [{
                    xtype: 'component',
                    id: 'tere',
                    width: 320,
                    cls: 'customer-history',
                    renderData: data,
                    renderTpl: [
                        '<div class="total-spent"><label>Total Spent</label><h2>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</h2></div>',
                        '<div class="total-orders"><label>Total Orders</label><h2>{[values.orderCount || 0]}</h2></div>',
                        '<div class="customer-since"><span>Customer Since: </span><span>{[Ext.util.Format.date(values.createDate, "m/d/Y")]}</span></div>'
                    ]
                }, {
                    store: this.tagStore,
                    xtype: 'boxselect',
                    width: 320,
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: false,
                    createNewOnEnter: true,
                    valueField: 'Key',
                    displayField: 'Value',
                    name: 'groups',
                    queryMode: 'local',
                    fieldLabel: 'Groups',
                    cls: 'customer-history'
                }]
            }]
        });
        
        
        var orders = this.record.getOrders();
        orders.load();
        orderGrid = Ext.create('Ext.panel.Panel', {
            width: 960,
            ui: 'subform',
            bodyPadding: '19 0',
            margin: '0 0 20 0',
            title: 'Order History',
            items: [{
                xtype: 'grid',
                //store: Taco.store.OrderHistory,
                store: orders,
                columns: [
                    { text: 'Order Id', dataIndex: 'orderNumber', flex: 1 },
                    { xtype: 'datecolumn', text: 'Order Date', dataIndex: 'createDate', flex: 1 },
                    { text: 'Order Amount', dataIndex: 'total', flex: 1 },
                    { text: 'Status', dataIndex: 'paymentStatus', flex: 1 }
                ],
            }]
        });

        contacts = Ext.create('Ext.panel.Panel', {
            width: 960,
            ui: 'subform',
            bodyPadding: '19 0',
            margin: '0 0 20 0',
            title: 'Billing Information',
            items: [{
                xtype: 'dataview',
                cls: 'addresses',
                itemSelector: '.address',
                store: contactsStore,
                tpl: [
                    '<tpl for="."><div class="address">',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                    '</div></tpl>'
                ],
                listeners: {
                    itemclick: function (view, record, item, index, e) {
                        var modal;

                        if (e.getTarget('.edit', 10)) {
                            modal = Ext.create('Taco.shared.view.modal.Address', {
                                record: record
                            });
                        }
                    }
                }
            }]
        });

        shippingInfo = Ext.create('Ext.panel.Panel', {
            width: 960,
            ui: 'subform',
            bodyPadding: '19 0',
            margin: '0 0 20 0',
            title: 'Shipping Information',
            items: [{
                xtype: 'dataview',
                cls: 'addresses',
                itemSelector: '.address',
                store: contactsStore,
                tpl: [
                    '<tpl for="."><div class="address">',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                    '</div></tpl>'
                ],
                listeners: {
                    itemclick: function (view, record, item, index, e) {
                        var modal;

                        if (e.getTarget('.edit', 10)) {
                            modal = Ext.create('Taco.shared.view.modal.Address', {
                                record: record
                            });
                        }
                    }
                }
            }]
        });

        notes = Ext.create('Ext.panel.Panel', {
            width: 960,
            ui: 'subform',
            bodyPadding: '19 0',
            margin: '0 0 20 0',
            title: 'Notes',
            items: [{
                xtype: 'dataview',
                cls: 'addresses',
                itemSelector: '.address',
                store: contactsStore,
                tpl: [
                    '<tpl for="."><div class="address">',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                    '</div></tpl>'
                ],
                listeners: {
                    itemclick: function (view, record, item, index, e) {
                        var modal;

                        if (e.getTarget('.edit', 10)) {
                            modal = Ext.create('Taco.shared.view.modal.Address', {
                                record: record
                            });
                        }
                    }
                }
            }]
        });

        this.items = [profile, contacts, shippingInfo, orderGrid, notes];

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