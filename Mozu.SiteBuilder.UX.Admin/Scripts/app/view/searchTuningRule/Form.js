/**
 * The Search Tuning Rule from
 */
Ext.define('Taco.view.searchTuningRule.Form', {   
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.searchTuningRule.form.General',
        'Taco.view.searchTuningRule.form.Context',
        'Taco.view.searchTuningRule.form.PinnedProduct',
        'Taco.view.searchTuningRule.form.BlockedProduct'
    ],
    autoDestroy: true,
    itemId: 'taco-searchTuningRule-form',

    createTitle: 'New Product Ranking Rule',
    editTitle: '{[values.record.data.name]}',
    isCatalogLevel: false,
    categoryCode: null,
    isCreate: false,

    initComponent: function () {

        var me = this;
        // Note: the record will act as an event bus for the subForms. 
        // User interactions in a subform that cause changes in other forms will communicate via events on the record.
        // Each subform will listen for and react to these changes.

        this.items = [
            {
                xtype: 'taco-searchTuningRule-general',
                itemId: 'general',
                parentForm: this,
                record: me.record,
                isCatalogLevel: me.isCatalogLevel,
                manageHeight: true
            }, 
            {
                xtype: 'taco-searchTuningRule-context',
                itemId: 'context',
                parentForm: this,
                record: me.record,
                categoryCode: me.categoryCode,
                isCreate: me.isCreate,
                manageHeight: true
            },
            {
                xtype: 'taco-searchTuningRule-pinned',
                itemId: 'pinned',
                parentForm: this,
                record: this.record,
                manageHeight: true
            }, 
            {
                xtype: 'taco-searchTuningRule-blocked',
                itemId: 'blocked',
                parentForm: this,
                record: this.record,
                manageHeight: true
            }
        ];

        if (this.isCatalogLevel) {
            this.header = false;
        }

        this.callParent(arguments);

        this.general = this.down('#general');
        this.context = this.down('#context');
        this.pinned = this.down('#pinned');
        this.blocked = this.down('#blocked');

        //this.on({
        //    afterrender: this.onAfterRender,
        //    scope: this
        //});

        this.loadNavItems();
    },

    //setFieldVisibility: function () {
    //    var scopeType = this.general.scopeTypeInput.getValue(),
    //        targetType = this.general.targetTypeInput.getValue(),
    //        discountType = this.general.amountTypeInput.getValue(),
    //        isLineItem = this.general.isLineItem(),
    //        isOrder = this.general.isOrder(),
    //        appliesToShipping = this.general.appliesToShipping();
            
        
    //    // need to pass all info necessary to the subforms to control their own visibility and fields.
    //    this.criteria.setFieldVisibility(scopeType, targetType, discountType);
    //    this.conditions.setFieldVisibility(scopeType, targetType, discountType);
    //    this.limitations.setFieldVisibility(scopeType, targetType, discountType);
    //    this.loadNavItems();
    //},

    //onAfterRender: function () {
    //    this.setFieldVisibility();
    //},


    /**
     * Preprocess form before the built in form processing. Persist field values with not matching field name in the record. Reset values no longer applicable based on current state of the form;
     * @private
     */
    beforeSave: function () {
        return (this.general.beforeSave()
            && this.context.beforeSave()
            && this.pinned.beforeSave()
            && this.blocked.beforeSave()
            );

    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
