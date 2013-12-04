/**
 * The discount editor view
 */
Ext.define('Taco.view.discount.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.ConfiguredShippingRates',
        'Ext.ux.form.field.BoxSelect',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.category.Modal',
        'Taco.view.product.Modal',
        'Taco.view.discount.GeneralForm',
        'Taco.view.discount.ConditionsForm',
        'Taco.view.discount.CriteriaForm'
    ],

    title: 'Discount',

    initComponent: function () {
        this.items = [{
            xtype: 'taco-discount-general',
            record: this.record
        }, {
            xtype: 'taco-discount-conditions',
            record: this.record
        }, {
            xtype: 'taco-discount-criteria',
            record: this.record
        }];

        this.callParent(arguments);   
    }
});
