/**
 * @class Taco.view.customers.Edit
 */
    Ext.define('Taco.view.customers.Edit', {
        extend: 'Taco.core.ux.form.Editor',
        requires: ['Taco.model.CouponCode', 'Taco.store.Orders', 'Taco.core.ux.form.DateTime', 'Taco.core.ux.form.BoxSelect', 'Taco.core.ux.modal.Content', 'Taco.core.ux.browser.ItemBrowser', 'Taco.core.ux.CustomerGroupComboBox', 'Taco.core.ux.modal.Helper', 'Taco.view.address.AddressForm', 'Taco.view.customers.AddressPanel', 'Taco.view.customers.GroupsForm'],
        title: 'New Customer',
        model: 'Taco.model.CustomerAccount',
        type: 'customer',
        displayAssociations: [],

        initComponent: function () {
            var me = this;

            var first = me.record.get("primaryFirstName"),
                last = me.record.get("primaryLastName");

            if (me.record.isModel && first != Ext.emptyString && last != Ext.emptyString) {
                me.title = first + ' ' + last;
            }

            // TODO: just stubbing out placeholders for now, nothing styled and some fake data in here
            me.preferences = Ext.widget('panel', {
                items: [{
                    defaults: {
                        padding: '0 10 0 0'
                    },
                    layout: 'hbox',
                    items: [{
                        xtype: 'label',
                        html: me.record.get('email')
                    }, {
                        xtype: 'action',
                        text: 'change email',
                        listeners: {
                            click: function (d) {
                                console.log('inline edit');
                            }
                        }
                    }]
                }, {
                    xtype: 'checkbox',
                    boxLabel: 'Please keep me up to date on store news and specials',
                    boxLabelAlign: 'after'
                }]
            });

            // TODO: just stubbing out placeholders for now, nothing styled and some fake data in here
            me.addresses = Ext.widget('panel', {
                layout: 'vbox',
                defaults: {
                    padding: '7 7 0 0'
                },
                items: [{
                    xtype: 'header',
                    title: 'Billing and Shipping Address'
                }, {
                    xtype: 'label',
                    html: first + ' ' + last
                }, {
                    xtype: 'label',
                    html: me.record.get('primaryAddress1') + me.record.get('primaryAddress2') + me.record.get('primaryAddress3')
                }, {
                    xtype: 'label',
                    html: me.record.get('primaryCityOrTown') + ', ' + me.record.get('primaryStateOrProvince') + ' ' + me.record.get('primaryPostalOrZipCode')
                }, {
                    xtype: 'label',
                    html: me.record.get('primaryCountryCode')
                }, {
                    xtype: 'label',
                    html: me.record.get('primaryPhoneNumber')
                }],
                actions: [
                ]
            });

            me.shippingAddresses = Ext.widget('action', {
                text: 'Click to add another shipping address',
                padding: '15 0 0 0',
                listeners: {
                    click : function () {
                        me.editAddress(me.record);
                    }
                }
            });

            me.stats = Ext.create('Ext.form.Panel', {
                border: true,
                defaults: {
                    margin: '10 10 10 10'
                },
                items: [{
                    xtype: 'panel',
                    layout: 'hbox',
                    items: [{
                        defaults: {
                            margin: '10 10 10 10'
                        },
                        layout: 'vbox',
                        items: [{
                            xtype: 'label',
                            html: 'Total Spent'
                        }, {
                            xtype: 'label',
                            html: Ext.util.Format.currency(me.record.get('spent'), '$', 2, false)
                        }]
                    }, {
                        defaults: {
                            margin: '10 10 10 10'
                        },
                        layout: 'vbox',
                        items: [{
                            xtype: 'label',
                            html: 'Total Orders'
                        }, {
                            xtype: 'label',
                            html: me.record.get('totalOrders')
                        }]
                    }]
                }, {
                    xtype: 'panel',
                    defaults: {
                        margin: '10 10 10 10'
                    },
                    items: [{
                        xtype: 'label',
                        html: 'Customer Since ' + (Ext.util.Format.date(me.record.get('lastOrderedOn'), 'M d Y') || "(unknown)")
                    }]
                }, {
                    xtype: 'panel',
                    defaults: {
                        margin: '10 10 10 10'
                    },
                    items: [{
                        xtype: 'boxselect',
                        name: 'groupsIds',
                        width: 500,
                        minChars: 2,
                        cls: 'taco-boxselect',
                        store: 'CustomerGroupComboBox',
                        displayField: 'display',
                        valueField: 'value',
                        shortField: 'display',
                        triggerOnClick: false,
                        pinList: false
                    }, {
                        xtype: 'action',
                        text: 'Edit Groups',
                        listeners: {
                            click: {
                                fn: function () {
                                    me.openCustomerGroupsForm(me.record);
                                }
                            }
                        }
                    }]
                }]
            });

            //console.log(me.record, me.record.get('customerSince'), me.record);
            me.addresslist = {
                layout: 'hbox',
                defaults: {
                    margin: '5 5 5 5'
                },
                items: []
            };
            Ext.each(me.record.get('addresses'), function (address) {
                me.addresslist.items.push(Ext.create('Taco.view.customers.AddressPanel', {
                    record: address
                }));
            });

            //me.orderHistory = // todo: needs to be built sometime in the future
            me.addNoteForm = {
                xtype: 'textfield',
                emptyText: 'add a note'
            };

            me.notesStore = Ext.create('Taco.store.CustomerAccountNotes', {
                autoLoad: true
            });

            me.ordersStore = Ext.create('Taco.store.Orders', {
                autoLoad: true,
                filters: [new Ext.util.Filter({
                    property: 'customerId',
                    value   : me.record.get('id')
                })]
            });

            me.basegrid = Ext.create('Taco.core.ux.BaseGrid', {

                store: me.notesStore,

                columns: [{
                    xtype: 'datecolumn',
                    dataIndex: 'createdOn',
                    minWidth: 125
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'content',
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'createdBy',
                    minWidth: 125
                }]
            });

            me.ordergrid = Ext.create('Taco.core.ux.BaseGrid', {

                store: me.ordersStore,

                columns: [{
                    text: 'Date Submitted',
                    xtype: 'gridcolumn',
                    dataIndex: 'submittedDate',
                    flex: 1
                }, {
                    text: 'Order Number',
                    xtype: 'gridcolumn',
                    dataIndex: 'orderNumber',
                    flex: 1
                }, {
                    text: 'Order Status',
                    xtype: 'gridcolumn',
                    dataIndex: 'orderStatus',
                    flex: 1
                }, {
                    text: 'Payment Status',
                    xtype: 'gridcolumn',
                    dataIndex: 'paymentStatus',
                    flex: 1
                }, {
                    text: 'Email',
                    xtype: 'gridcolumn',
                    dataIndex: 'email',
                    flex: 1
                }, {
                    text: 'Total',
                    xtype: 'numbercolumn',
                    format: '$0,000.00',
                    dataIndex: 'total',
                    flex: 1
                }]
            });

            me.tabs = [{
                layout: { type: 'vbox', align: 'stretch' },
                items: [{
                    layout: { type: 'hbox', align: 'stretch' },
                    items: [{
                        layout: 'vbox',
                        items: [me.preferences, me.addresses, me.shippingAddresses]
                    }, {
                        layout: 'vbox',
                        items: [me.stats]
                    }]
                }, {
                    layout: { type: 'vbox', align: 'fit' },
                    items: [me.addresslist]
                }, {
                    layout: { type: 'vbox', align: 'stretch' },
                    items: [me.ordergrid]
                }, {
                    layout: { type: 'vbox', align: 'stretch' },
                    defaults: '5 0 5 0',
                    items: [{
                        xtype: 'label',
                        margin: '20 0 0 0',
                        autoEl: {
                            tag: 'h3',
                            html: 'Internal Notes'
                        }
                    },
                        me.addNoteForm,
                        me.basegrid
                    ]
                }]
            }];

            me.on({
                load: {
                    fn: me.onLoad,
                    scope: me
                }
            });

            me.actions = [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                eventName: 'save'
            }];

            me.callParent(arguments);
        },

        openCustomerGroupsForm: function (record) {
            Ext.create('Taco.core.ux.modal.Helper', {
                form: {
                    editors: ['Taco.view.customers.GroupsForm'],
                    record: record
                }
            });
        },

        editAddress: function (record) {
            Ext.create('Taco.core.ux.modal.Helper', {
                form: {
                    editors: ['Taco.view.address.AddressForm'],
                    record: record
                }
            });
        },

        onLoad: function (record) {
            var me = this;
            //debugger;
            //console.log(record);
        },

        onNavigate: function (newState) {
            console.log('onNavigate');
            var md = newState.getMetaData();
            if (md.controller && md.controller === "customers" && (md.action === "index" || !md.action)) {
                this.destroy();
                return false;
            }
        },

        onFormStateChange: function (form) {
            console.log('onFormStateChange');
            if (!this.dirtyButton) {
                return;
            }
            /*if (!form || !form.isValid || !form.isDirty) {
            form = this.tabForm.getForm();
            }*/
            this.dirtyButton.setDirty(form.isValid() && form.isDirty());
        }
    });

