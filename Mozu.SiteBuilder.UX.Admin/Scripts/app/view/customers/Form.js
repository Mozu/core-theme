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
                    bodyPadding: '19 0',
                    cls: 'customer-info',
                    items: [{
                        xtype: 'component',
                        width: 320,
                        renderData: data,
                        renderTpl: [
                            '<div class="info-name">{[values.primaryFirstName]} {[values.primaryLastName]}</div>',
                            '<div class="info-email"><span><a href="">{[values.primaryEmail]}</a></span></div>'
                        ]
                    }, {
                            xtype: 'checkboxfield',
                            name: 'acceptsMarketing',
                            boxLabel: 'Yes, keep me up to date on store news and specials'
                        }]
            }, {
                xtype: 'container',
                width: 320,
                cls: 'customer-settings',
                items: [{
                    xtype: 'component',
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
            cls: Taco.baseCSSPrefix + 'customer-billingInfo',
            items: [{
                xtype: 'dataview',
                cls: 'addresses',
                itemSelector: '.address',
                store: contactsStore,
                width: 300,
                tpl: [
                    '<tpl for=".">' +
                    '<div class="address">',
                    '<div class="edit"><a>Edit</a></div>',
                    '<hr>',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
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
            cls: Taco.baseCSSPrefix + 'customer-shippingInfo',
            items: [{
                xtype: 'dataview',
                cls: 'addresses',
                itemSelector: '.address',
                width: 300,
                store: contactsStore,
                tpl: [
                    '<tpl for="."><div class="address">',
                    '<div class="edit"><a>Edit</a></div>',
                    '<hr>',
                    '<div class="name">{firstName} {middleName} {lastName}</div>',
                    '<div class="address-line-1">{address1}</div>',
                    '<div class="address-line-2">{address2}</div>',
                    '<div class="address-line-3">{address3}</div>',
                    '<div class="city-state-zip">{cityOrTown}, {state} {zipCode}</div>',
                    '<div class="country">{email}</div>',
                    '<div class="phone">{homePhone}</div>',
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
            cls: Taco.baseCSSPrefix + 'customer-notes',
            items: [{
                xtype: 'textfield',
                minLength: 3,
                name: 'productName',
                emptyText: 'Add a note',
                width: '100%'
            }/*, {
                xtype: 'container',
                cls: 'notes',
                html: '<div class="date">March 19, 2012</div>'+
                    '<div><div class="time">08:50 am</div><div class="description">"Oh also... Make sure they get super customer service!"</div><div class="name">Palev Water</div></div>' +
                    '<div class="date"></div>'+
                    '<div><div class="time">08:45 pm</div><div class="description">"They actually hate birds."</div><div class="name">Palev Water</div></div>'
            }*/]
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