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
                cls: Taco.baseCSSPrefix + "flex-width-200 " + Taco.baseCSSPrefix + "no-margin-label"
            }, {
                name: 'lastName',
                fieldLabel: 'Last Name',
                cls: Taco.baseCSSPrefix + "flex-width-200 " + Taco.baseCSSPrefix + "no-margin-label"
            }, {
                name: 'companyOrOrganization',
                fieldLabel: 'Company',
                cls: Taco.baseCSSPrefix + "flex-width-200"
            }, {
                name: 'phoneNumbers',
                fieldLabel: 'Phone',
                cls: Taco.baseCSSPrefix + "flex-width-200"
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
                fieldLabel: 'City',
                cls: Taco.baseCSSPrefix + "flex-width-200"
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
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [{
                xtype: 'radiogroup',
                fieldLabel: 'Shipping Method',
                cls: Taco.baseCSSPrefix + "flex-width-360 " + Taco.baseCSSPrefix + "no-margin-label",
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