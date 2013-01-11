/**
 * @class Taco.view.phoneOrder.BillingSection
 * @author Jimmy Sanford
 */
Ext.define('Taco.view.phoneOrder.BillingSection', {
    extend: 'Taco.core.ux.form.Form',

    bodyCls: Taco.baseCSSPrefix + 'flexform',
    title: 'Billing',

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
            width: 400,
            padding: '0 20',
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [{
                name: 'creditCardNumber',
                fieldLabel: 'Credit Card',
                width: 360
            }, {
                name: 'expirationDate',
                fieldLabel: 'Expiration Date',
                width: 170
            }, {
                name: 'securityCode',
                fieldLabel: 'Security Code',
                width: 170
            }]
        }];

        this.callParent(arguments);
    }
});