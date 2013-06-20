/**
 * @class Taco.view.customers.Form
 */
Ext.define('Taco.view.customers.Form', {
    extend: 'Taco.core.ux.form.Form',

    initComponent: function () {
        var data = this.record.getData(),
            contactsStore = this.record.getContacts(),
            profile, contacts;

        this.title = [
            data.primaryFirstName,
            data.primaryMiddleName,
            data.primaryLastName
        ].join(' ');

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
                //     xtype: 'textfield',
                //     width: 320,
                //     name: 'primaryEmail',
                //     fieldLabel: 'Email Address'
                // }, {
                    xtype: 'boxselect',
                    width: 320,
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: false,
                    createNewOnEnter: true,
                    name: 'groups',
                    queryMode: 'local',
                    fieldLabel: 'Groups',
                    store: []
                }, {
                    xtype: 'checkboxfield',
                    name: 'acceptsMarketing',
                    fieldLabel: 'Marketing',
                    boxLabel: 'Yes, keep me up to date on store news and specials'
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
    }
});