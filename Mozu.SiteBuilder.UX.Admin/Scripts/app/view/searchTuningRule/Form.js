/**
 * The Search Tuning Rule from
 */
Ext.define('Taco.view.searchTuningRule.Form', {   
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.searchTuningRule.GeneralForm',
        'Taco.view.searchTuningRule.ContextForm',
        'Taco.view.searchTuningRule.PinnedProductForm',
        'Taco.view.searchTuningRule.BlockedProductForm'
    ],
    autoDestroy: true,

    createTitle: 'New Rule',
    editTitle: '{[values.record.data.name]}',
    isCatalogLevel: false,

    initComponent: function () {

        var me = this;
        // Note: the record will act as an event bus for the subForms. 
        // User interactions in a subform that cause changes in other forms will communicate via events on the record.
        // Each subform will listen for and react to these changes.

        this.items = [{
                xtype: 'taco-searchTuningRule-general',
                itemId: 'general',
                parentForm: this,
                record: me.record,
                isCatalogLevel: me.isCatalogLevel,
                manageHeight: true
            }, {
                xtype: 'taco-searchTuningRule-context',
                itemId: 'context',
                parentForm: this,
                record: me.record,
                manageHeight: true
            }, {
                xtype: 'taco-searchTuningRule-pinned',
                itemId: 'pinned',
                parentForm: this,
                record: this.record,
                manageHeight: true
            }, {
                xtype: 'taco-searchTuningRule-blocked',
                itemId: 'blocked',
                parentForm: this,
                record: this.record,
                manageHeight: true
            }
        ];

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

    getValues: function() {
        //console.log('form.getValues');
        var generalData = this.general.getForm().getValues(),
            contextData = this.context.getValues();
        return Ext.Object.merge(generalData, contextData);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
