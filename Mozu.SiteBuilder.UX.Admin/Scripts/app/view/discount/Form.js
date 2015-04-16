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
        'Taco.view.discount.LimitationsForm',
        'Taco.view.discount.CriteriaForm'
    ],

    createTitle: 'Create Discount',
    editTitle: '{[values.record.data.name]}',

    initComponent: function () {

        // Note: the record will act as an event bus for the subForms. 
        // User interactions in a subform that cause changes in other forms will communicate via events on the record.
        // Each subform will listen for and react to these changes.

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
            xtype: 'taco-discount-criteria',
            itemId: 'criteria',
            parentForm: this,
            record: this.record,
            hidden: true,
            manageHeight: true
        },{
            xtype: 'taco-discount-limitations',
            itemId: 'limitations',
            parentForm: this,
            record: this.record,
            manageHeight: true
        }];

        this.callParent(arguments);

        this.general = this.down('#general');
        this.conditions = this.down('#conditions');
        this.criteria = this.down('#criteria');
        this.limitations = this.down('#limitations');

        if (!this.isEdit()) this.general.setTitle('Create');

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });

        this.loadNavItems();
    },

    setFieldVisibility: function () {
        var scopeType = this.general.scopeTypeInput.getValue(),
            targetType = this.general.targetTypeInput.getValue(),
            discountType = this.general.amountTypeInput.getValue(),
            isLineItem = this.general.isLineItem(),
            isOrder = this.general.isOrder(),
            appliesToShipping = this.general.appliesToShipping();
            
        
        // need to pass all info necessary to the subforms to control their own visibility and fields.
        this.criteria.setFieldVisibility(scopeType, targetType, discountType);
        this.conditions.setFieldVisibility(scopeType, targetType, discountType);
        this.limitations.setFieldVisibility(scopeType, targetType, discountType);
        this.loadNavItems();
    },

    onAfterRender: function () {
        this.setFieldVisibility();
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
