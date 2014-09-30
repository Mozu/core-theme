/**
 * The discount editor view
 */
Ext.define('Taco.view.discount.Form', {   
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.store.ConfiguredShippingRates',
        'Ext.ux.form.field.BoxSelect',
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField',
        'Taco.view.category.Modal',
        'Taco.view.product.Modal',
        'Taco.view.discount.GeneralForm',
        'Taco.view.discount.ConditionsForm',
        'Taco.view.discount.CriteriaForm',
        'Taco.view.discount.LimitationsForm'
    ],

    createTitle: 'Create Discount',
    editTitle: '{[values.record.data.name]}',

    initComponent: function () {
        this.items = [{
            xtype: 'taco-discount-general',
            itemId: 'general',
            parentForm: this,
            record: this.record,
            manageHeight: true
        }, {
            xtype: 'taco-discount-conditions',
            itemId: 'conditions',
            parentForm: this,
            record: this.record,
            manageHeight: true
        }, {
            xtype: 'taco-discount-limitations',
            itemId: 'limitations',
            parentForm: this,
            record: this.record,
            manageHeight: true
        }, {
            xtype: 'taco-discount-criteria',
            itemId: 'criteria',
            parentForm: this,
            record: this.record,
            hidden: true,
            manageHeight: true
        }];

        this.callParent(arguments);

        this.general = this.down('#general');
        this.conditions = this.down('#conditions');
        this.criteria = this.down('#criteria');

        if (!this.isEdit()) this.general.setTitle('Create');

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });

        this.loadNavItems();
    },

    setFieldVisibility: function () {
        var isLineItem = this.general.isLineItem(),
            appliesToShipping  = this.general.appliesToShipping();

        this.criteria.setFieldVisibility(isLineItem, appliesToShipping);
        this.conditions.setFieldVisibility(isLineItem, appliesToShipping);
        this.loadNavItems();
    },

    onAfterRender: function () {
        this.setFieldVisibility();
    }
});
