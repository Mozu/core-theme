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
            xtype: "checkbox",
            boxLabel: "Same as shipping",
            width: "100%"
        }, {
            xtype: 'formflexbox',
            width: 420,
            defaults: {
                xtype: 'textfield',
                labelAlign: 'top',
                labelSeparator: '',
                cls: Taco.baseCSSPrefix + "flex-width-200"
            },
            items: [{
                name: 'firstName',
                fieldLabel: 'First Name'
            }, {
                name: 'lastName',
                fieldLabel: 'Last Name'
            }, {
                name: 'companyOrOrganization',
                fieldLabel: 'Company'
            }, {
                name: 'phoneNumbers',
                fieldLabel: 'Phone'
            }, {
                name: 'address1',
                fieldLabel: 'Address Line 1',
                cls: Taco.baseCSSPrefix + "flex-width-420"
            }, {
                name: 'address2',
                fieldLabel: 'Address Line 2',
                cls: Taco.baseCSSPrefix + "flex-width-420"
            }, {
                name: 'cityOrTown',
                fieldLabel: 'City'
            }, {
                name: 'stateOrProvince',
                fieldLabel: 'State',
                cls: Taco.baseCSSPrefix + "flex-width-90"
            }, {
                name: 'postalOrZipCode',
                fieldLabel: 'ZIP Code',
                cls: Taco.baseCSSPrefix + "flex-width-90"
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
                cls: Taco.baseCSSPrefix + "flex-width-360"
            }, {
                name: 'expirationDate',
                fieldLabel: 'Expiration Date',
                cls: Taco.baseCSSPrefix + "flex-width-170"
            }, {
                name: 'securityCode',
                fieldLabel: 'Security Code',
                cls: Taco.baseCSSPrefix + "flex-width-170"
            }]
        }];

        this.callParent(arguments);
    }
});