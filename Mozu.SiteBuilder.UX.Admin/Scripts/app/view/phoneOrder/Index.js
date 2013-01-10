/**
 * @class Taco.view.phoneOrder.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.phoneOrder.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.form.Form', 'Taco.core.ux.simplegrid.Grid'],

    header: {
        title: 'Phone Orders'
    },

    initComponent: function () {
        var me = this,
            fakeProductStore;

        Ext.define('fakeProduct', {
            extend: 'Ext.data.Model',
            fields: ['fakeName']
        });

        fakeProductStore = Ext.create('Ext.data.Store', {
            model: 'fakeProduct',
            data: [
                { fakeName: 'one' },
                { fakeName: 'two' },
                { fakeName: 'three' }
            ]
        });

        this.form = Ext.create('Taco.core.ux.form.Form', {
            manageHeight: false,
            width: 860,
            defaults: {
                xtype: 'formeditor2',
                frameHeader: false,
                manageHeight: false,
                margin: '0 0 14 0',
                bodyPadding: '14 0 14 14'
            },
            items: [{
                title: 'Customer',
                items: [{
                    xtype: 'radiogroup',
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Existing', name: 'customerStatus', inputValue: 0 },
                        { boxLabel: 'New', name: 'customerStatus', inputValue: 1 }
                    ]
                }]
            }, {
                title: 'Cart',
                items: [{
                    xtype: 'simplegrid',
                    store: fakeProductStore,
                    columns: [{
                        dataIndex: 'fakeName',
                        text: 'Product',
                        editable: false
                    }]
                }]
            }, {
                title: 'Shipping',
                bodyCls: Taco.baseCSSPrefix + 'flexform',
                items: [{
                    xtype: 'formflexbox',
                    width: 420,
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'top',
                        labelSeparator: ''
                    },
                    items: [{
                        name: 'firstName',
                        fieldLabel: 'First Name',
                        width: 200
                    }, {
                        name: 'lastName',
                        fieldLabel: 'Last Name',
                        width: 200
                    }, {
                        name: 'companyOrOrganization',
                        fieldLabel: 'Company',
                        width: 200
                    }, {
                        name: 'phoneNumbers',
                        fieldLabel: 'Phone',
                        width: 200
                    }, {
                        name: 'address1',
                        fieldLabel: 'Address Line 1',
                        width: 420
                    }, {
                        name: 'address2',
                        fieldLabel: 'Address Line 2',
                        width: 420
                    }, {
                        name: 'cityOrTown',
                        fieldLabel: 'City',
                        width: 200
                    }, {
                        name: 'stateOrProvince',
                        fieldLabel: 'State',
                        width: 90
                    }, {
                        name: 'postalOrZipCode',
                        fieldLabel: 'ZIP Code',
                        width: 90
                    }]
                }, {
                    xtype: 'formflexbox',
                    width: 200,
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'top',
                        labelSeparator: ''
                    },
                    items: [{
                        xtype: 'radiogroup',
                        fieldLabel: 'Shipping Method',
                        columns: 1,
                        vertical: true,
                        items: [
                            { boxLabel: 'USPS', name: 'shippingMethod', inputValue: 'usps' },
                            { boxLabel: 'UPS', name: 'shippingMethod', inputValue: 'ups' },
                            { boxLabel: 'FedEx', name: 'shippingMethod', inputValue: 'fedex' }
                        ]
                    }]
                }]
            }, {
                title: 'Billing',
                items: [{
                    xtype: 'component',
                    html: 'billing form here'
                }]
            }]
        });

        this.formLinks = Ext.create('Ext.Component', {
            width: 180,
            margin: '0 20 0 0',
            cls: Taco.baseCSSPrefix + 'formeditor-links',
            html: '<ul style="position: fixed;"><li>Customer</li><li>Cart</li><li>Shipping</li><li>Billing</li></ul>'
        });

        Ext.apply(me.body, {
            layout: { type: 'hbox', align: 'stretchmax' },
            items: [me.formLinks, me.form]
        });

        this.callParent(arguments);
    }
});