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

    mixins: {
        navigable: 'Taco.core.ux.mixins.Navigable'
    },

    title: 'Discount',

    constructor: function () {
        
        this.callParent(arguments);

        this.mixins.navigable.constructor.call(this);
    },

    initComponent: function () {
        this.items = [{
            xtype: 'taco-discount-general',
            itemId: 'general',
            parentForm: this,
            record: this.record
        }, {
            xtype: 'taco-discount-conditions',
            itemId: 'conditions',
            parentForm: this,
            record: this.record
        }, {
            xtype: 'taco-discount-criteria',
            itemId: 'criteria',
            parentForm: this,
            record: this.record,
            hidden: true
        }];

        this.callParent(arguments);

        this.general = this.down('#general');
        this.conditions = this.down('#conditions');
        this.criteria = this.down('#criteria');

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });
    },

    setFieldVisibility: function () {
        var isLineItem = this.general.isLineItem(),
            appliesToShipping  = this.general.appliesToShipping();

        this.criteria.setFieldVisibility(isLineItem, appliesToShipping);
        this.conditions.setFieldVisibility(isLineItem, appliesToShipping);
    },

    onAfterRender: function () {
        this.setFieldVisibility();
    }
});
