/**
 * @class Taco.view.generalSettings.subform.AddressValidation
 * @author Ojas Patel
* @date 11/22/2013
 *
 */

Ext.define('Taco.view.generalSettings.subform.AddressValidation', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],

    title: 'Address Validation',
    margin: '0 0 20 0',
    ui: 'subform',

    initComponent: function () {
        var me = this;

        this.defaults = {
            labelAlign: 'top',
            labelSeparator: ''
        };

        this.items = [{
            xtype: 'checkbox',
            name: 'isAddressValidationEnabled',
            itemId: 'isAddressValidationEnabled',
            boxLabel: 'Address Validation Enabled',
            boxLabelAlign: 'after',
            inputValue: true,
            uncheckedValue: false
        }, {
            xtype: 'checkbox',
            name: 'allowInvalidAddresses',
            itemId: 'allowInvalidAddresses',
            boxLabel: 'Allow Invalid Addresses',
            boxLabelAlign: 'after',
            inputValue: true,
            uncheckedValue: false
        }];

        this.callParent(arguments);
    }
});
