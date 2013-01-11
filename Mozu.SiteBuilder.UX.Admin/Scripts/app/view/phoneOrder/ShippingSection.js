/**
 * @class Taco.view.phoneOrder.ShippingSection
 * @author Jimmy Sanford
 */
Ext.define('Taco.view.phoneOrder.ShippingSection', {
    extend: 'Taco.core.ux.form.Form',

    bodyCls: Taco.baseCSSPrefix + 'flexform',
    title: 'Shipping',

    initComponent: function () {
        var me = this;

        this.items = [{
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
        }];

        this.callParent(arguments);
    }
});