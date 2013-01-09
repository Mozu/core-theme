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
            defaults: {
                xtype: 'formeditor2',
                collapsible: true,
                frameHeader: false,
                manageHeight: false,
                margin: '0 0 14 0',
                bodyPadding: '0 14 14'
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
                bodyPadding: '0 0 14',
                items: [{
                    xtype: 'formflexbox',
                    width: 612,
                    padding: '0 14',
                    defaults: {
                        xtype: 'textfield',
                        labelAlign: 'top',
                        labelSeparator: ''
                    },
                    items: [{
                        name: 'firstName',
                        fieldLabel: 'First Name',
                        width: 280
                    }, {
                        name: 'lastName',
                        fieldLabel: 'Last Name',
                        width: 280
                    }, {
                        name: 'companyOrOrganization',
                        fieldLabel: 'Company',
                        width: 280
                    }, {
                        name: 'phoneNumbers',
                        fieldLabel: 'Phone',
                        width: 280
                    }, {
                        name: 'address1',
                        fieldLabel: 'Address Line 1',
                        width: 584
                    }, {
                        name: 'address2',
                        fieldLabel: 'Address Line 2',
                        width: 584
                    }, {
                        name: 'cityOrTown',
                        fieldLabel: 'City',
                        width: 280
                    }, {
                        name: 'stateOrProvince',
                        fieldLabel: 'State',
                        width: 116
                    }, {
                        name: 'postalOrZipCode',
                        fieldLabel: 'ZIP Code',
                        width: 116
                    }]
                }]
            }]
        });

        Ext.apply(me.body, {
            layout: 'auto',
            items: [me.form]
        });

        this.callParent(arguments);
    }
});