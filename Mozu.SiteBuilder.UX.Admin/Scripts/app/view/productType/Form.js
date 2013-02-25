/**
 * @class Taco.view.productType.Form
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.form.field.MultiSelect'],

    title: 'Product Type',

    initComponent: function () {
        var options = this.record.get('options');

        console.log(options);

        this.items = [{
            xtype: 'taco.field.multiselect',
            fieldLabel: 'Options',
            store: options
        }];

        this.callParent(arguments);
    }
});