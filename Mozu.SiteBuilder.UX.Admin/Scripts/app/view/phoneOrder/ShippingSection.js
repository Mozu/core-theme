/**
 * @class Taco.view.phoneOrder.ShippingSection
 * @author Jimmy Sanford
 */
Ext.define('Taco.view.phoneOrder.ShippingSection', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.model.Shipment', 'Taco.model.Address', 'Taco.core.ux.form.FlexBox'],

    bodyCls: Taco.baseCSSPrefix + 'flexform',
    title: 'Shipping',

    createTitle: 'Shipping',
    editTitle: 'Shipping',

    initComponent: function () {
        var me = this;

        this.record = Ext.create('Taco.model.Shipment');

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
                name: 'phoneNumber',
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
                name: 'address3',
                fieldLabel: 'Address Line 3',
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
                xtype: 'radiogroup',
                fieldLabel: 'Shipping Method',
                width: 360,
                columns: 1,
                vertical: true,
                items: [
                    { boxLabel: 'USPS', name: 'shippingMethod', inputValue: 'usps' },
                    { boxLabel: 'UPS', name: 'shippingMethod', inputValue: 'ups' },
                    { boxLabel: 'FedEx', name: 'shippingMethod', inputValue: 'fedex' }
                ]
            }]
        }, {
            xtype: 'button',
            width: 80,
            height: 30,
            text: 'click me',
            handler: function () {
                var values = me.getValues(),
                    address;

                address = Ext.create('Taco.model.Address', values);

                console.log(address);
            }
        }];

        this.callParent(arguments);
    }
});