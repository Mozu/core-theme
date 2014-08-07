Ext.define('Taco.view.customers.subform.Information', {
    extend: 'Taco.view.customers.subform.Subform',

    requires: [
        'Ext.ux.form.field.BoxSelect'
    ],

    title: 'Shopper ID',
    cls: Taco.baseCSSPrefix + 'customer-information',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    initComponent: function () {

        var me = this,
            data = this.record ? this.record.getData() : {
                createDate: new Date()
            };

        if (this.record) this.setTitle('Shopper ID: ' + this.record.getId());

        this.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            padding: '0 0 0 10',
            itemId: 'taxExemptIdField',
            flex: 1,
            name: 'taxId',
            cls: 'no-field-padding',
            hidden: !data.taxExempt
        });

        this.taxExamptField = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                    xtype: 'checkboxfield',
                    name: 'taxExempt',
                    itemId: 'taxExemptCheckbox',
                    boxLabel: 'Tax Exempt',
                    listeners: {
                        change: function (field, newValue, oldValue, eOpts) {
                            this.taxExemptIdField.setVisible(newValue);
                        },
                        scope: this
                    }
                },
                this.taxExemptIdField
            ]
        });

        this.items = [{
            xtype: 'container',
            defaults: {
                width: '100%'
            },
            flex: 1,
            padding: '0 10 0 0',
            items: [{
                    xtype: 'textfield',
                    cls: 'no-field-padding',
                    name: 'firstName',
                    fieldLabel: 'First Name',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    name: 'lastName',
                    fieldLabel: 'Last Name',
                    allowBlank: false
                }, {
                    xtype: 'textfield',
                    padding: '0 0 16 0',
                    name: 'emailAddress',
                    fieldLabel: 'Email',
                    allowBlank: false
                }, {
                    xtype: 'checkboxfield',
                    name: 'isAnonymous',
                    boxLabel: 'Create shopper account',
                    itemId: 'createAccountCheckbox',
                    checked: !this.record,
                    hidden: this.record
                }, {
                    xtype: 'checkboxfield',
                    name: 'acceptsMarketing',
                    boxLabel: 'Yes, keep me up to date on store news and specials'
                },
                this.taxExamptField
            ]
        }, {
            xtype: 'container',
            cls: 'customer-settings',
            flex: 1,
            padding: '0 0 0 10',
            items: [{
                xtype: 'component',
                cls: 'customer-history',
                data: data,
                tpl: [
                    '<table width="100%">',
                    '<tr>',
                    '<td>',
                    '<label>Lifetime Value</label>',
                    '<h2 data-handle="customer-total-spent"><tpl if="typeof totalSpent === \'number\'">{totalSpent:currency}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>Fulfilled Orders</label>',
                    '<h2 data-handle="customer-order-count"><tpl if="typeof orderCount === \'number\'">{orderCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '<td>',
                    '<label>Total Visits</label>',
                    '<h2 data-handle="customer-visit-count"><tpl if="typeof visitCount === \'number\'">{visitCount}<tplelse>N/A</tpl></h2>',
                    '</td>',
                    '</table>',
                    '<div>Customer Since: <span data-handle="customer-since">{createDate:date("m/d/Y")}</span></div>'
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                padding: '48 10 16 0',
                width: '100%',
                items: [{
                    xtype: 'boxselect',
                    padding: '0 5 0 0',
                    fieldLabel: 'Customer Segments',
                    itemId: 'customerSegments',
                    store: this.segmentStore,
                    getStore: function () {
                        return me.segmentStore;
                    },
                    name: 'segmentIds',
                    valueField: 'id',
                    displayField: 'code',
                    hideTrigger: true,
                    triggerOnClick: false,
                    forceSelection: true,
                    disableKeyFilter: true,
                    flex: 1
                }, {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () {
                        this.launchSegmentModal();
                    },
                    scope: this
                }]
            }, {
                xtype: 'button',
                scale: 'medium',
                ui: 'link',
                text: 'View Wishlist',
                handler: function () {
                    Ext.create('Taco.shared.view.modal.Wishlist', {
                        record: this.record
                    });
                },
                scope: this
            }, {
                xtype: 'button',
                scale: 'medium',
                ui: 'link',
                text: 'View Gift Cards & Store Credits',
                handler: function () {
                    Ext.create('Taco.shared.view.modal.StoreCredit', {
                        record: this.record
                    });
                },
                scope: this
            }]
        }];

        this.callParent(arguments);
    },

    launchSegmentModal: function () {
        var list = this.down('#customerSegments'),
            listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.CustomerSegments',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    }
});