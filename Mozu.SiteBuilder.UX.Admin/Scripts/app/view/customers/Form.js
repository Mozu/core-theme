/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.store.CustomerTags'],
    initComponent: function () {
        var data = this.record.getData(),
            contactsStore = this.record.getContacts(),
            profile, contacts;

        this.title = [
            data.primaryFirstName,
            data.primaryMiddleName,
            data.primaryLastName
        ].join(' ');

        this.tagStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerTags');


        this.tagStore.on('add', function (store, records) {
            console.log('tagstoreadd', records);
        });

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'customer-editor';

        profile = Ext.create('Taco.core.ux.EditContainer', {
            width: 960,
            title: 'Customer Profile',
            cls: Taco.baseCSSPrefix + 'customer-profile',
            items: [{
                    xtype: 'container',
                    width: 320,
                    cls: 'customer-settings',
                    items: [{
                            store: this.tagStore,
                            xtype: 'boxselect',
                            width: 320,
                            hideTrigger: true,
                            triggerOnClick: false,
                            forceSelection: false,
                            createNewOnEnter: true,
                            valueField: 'Key',
                            displayField :'Value',
                            name: 'groups',
                            queryMode: 'local',
                            fieldLabel: 'Groups'
                        }, {
                            xtype: 'checkboxfield',
                            name: 'acceptsMarketing',
                            fieldLabel: 'Marketing',
                            boxLabel: 'Yes, keep me up to date on store news and specials',
                    
                            // checked: this.record.get('acceptsMarketing')
                        }]
                }, {
                    xtype: 'component',
                    width: 320,
                    cls: 'customer-history',
                    renderData: data,
                    renderTpl: [
                        '<div class="total-orders"><label>Total Orders</label><h2>{[values.totalOrders || 0]}</h2></div>',
                        '<div class="total-spent"><label>Total Spent</label><h2>{[Ext.util.Format.usMoney(values.totalSpent || 0)]}</h2></div>',
                        '<div class="customer-since"><label>Customer Since</label><h2>Never</h2></div>',
                    ]
                }]
        });

        contacts = Ext.create('Taco.core.ux.EditContainer', {
            width: 960,
            title: 'Billing & Shipping Addresses',
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
                    '<div class="country">{countryCode}</div>',
                    '<div class="phone">{homePhone}</div>',
                    '<div class="edit">E</div>',
                    '</div></tpl>'
                ],
                listeners: {
                    itemclick: function (view, record, item, index, e) {
                        var modal;

                        if (e.getTarget('.edit', 10)) {
                            modal = Ext.create('Taco.view.address.ModalEditor', {
                                record: record
                            });
                        }
                    }
                }
            }]
        });

        this.items = [profile, contacts];

        this.callParent(arguments);

        console.log(contactsStore);

        this.loadRecord(this.record);
    },
    onBeforeSave:function () {
        var groups = this.findField('groups');
        if (groups.isDirty()) {
            groups.getValue().
        }
    }
});