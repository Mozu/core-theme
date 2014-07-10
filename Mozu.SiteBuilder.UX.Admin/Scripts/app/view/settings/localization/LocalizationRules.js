/**
 * @class Taco.view.settings.localization.LocalizationRules
*/
Ext.define('Taco.view.settings.localization.LocalizationRules', {
    extend: 'Taco.core.ux.browser.SearchList',
  
    requires: [
         'Ext.Date',
        'Ext.form.Panel', 'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter',
        'Taco.core.ux.action.SecondaryButton',
        'Taco.core.ux.FilterableDataView', 'Taco.core.ux.grid.MenuColumn',
        'Taco.store.ShippingZones',
        'Taco.model.TargetRule'

    ],
    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.TargetRule',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,

    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: true,

    hideSearchToolbar: false,
    selType: 'rowmodel',

    autoScroll: true,

    enableQuickFilters: false,

    advancedSearchConfig: {
        advancedFormCls: 'Taco.core.ux.form.Form',

        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{}, 'All Orders']
        ]
    },




    stateful: false,

    //stateId: 'statefulOrderGrid',



    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        me.callParent(arguments);
    },
   
    onCreate: function () {
        return Taco.core.StateManager.attemptNavigate(this.createRoute);
    },

    createButtonText: "Create New Zone",
    title: "Shipping Zones",
    createRoute: 'shipping/zonescreate',
    editorRoute: 'shipping/zonesedit',

    launchLoadedEditor: function (record, options) {
        var complexMetaData = { record: record, options: options };
        
        if (this.reFetchRecordOnEdit) {
            delete complexMetaData.record;
        }

        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate( this.editorRoute + '/' + record.getId(), complexMetaData);
        }, 1, this);
    }
    
});


