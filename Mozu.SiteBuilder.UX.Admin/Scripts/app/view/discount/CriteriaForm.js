/**
 * @class  Taco.view.discount.CriteriaForm
 * @author Travis Johnson
 * @description Discount Target Criteria
 */
Ext.define('Taco.view.discount.CriteriaForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-criteria',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Target Criteria',

    initComponent: function () {
        

        this.callParent(arguments);

    }
});