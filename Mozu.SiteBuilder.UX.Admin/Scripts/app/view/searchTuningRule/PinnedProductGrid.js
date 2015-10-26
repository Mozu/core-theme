/**
* @class Taco.view.searchTuningRule.PinnedProductGrid
*/

Ext.define('Taco.view.searchTuningRule.PinnedProductGrid', {
   extend: 'Taco.core.ux.browser.SearchList',
   alias: 'widget.searchTuningRule-pinned-grid',
   requires: [],
   stateful: false,
   enableNavHeader: false,
   //minHeight: 240,
   autoHeight: true,
   //height:300,
   pageSize: 5,
   //store: {
   //    type: 'Taco.store.DiscountGrid',
   //    createOnly:true,
   //    pageSize:10
   //},
   launchEditorOnClick: false,
   deferEmptyText:false,
   emptyText: 'None Available',

   autoScroll: false,

   config: {
       code: null
   },


   deferEmtpyText: false,

   showActionsColumn : true,

   autoHidePagingToolbar:false,

   minHeight: 240,
   enableEditAction: false,
   enableDuplicateAction: false,
   enableDeleteAction: false,

   enableAutoSelect:false,

   initComponent: function() {
       var me = this;

       me.dockedItems = me.dockedItems || [];
       me.mixins = me.mixins || [];
        
       this.viewConfig = this.viewConfig || {};
       this.viewConfig.deferEmptyText = this.deferEmptyText;
        
       me.store = Taco.core.data.StoreManager.getOrCreate({
           type: 'Taco.store.PinnedProducts',
           createOnly: true,
           pageSize: this.pageSize,
           autoLoad: false
       });

       this.callParent(arguments);

   },

   getActionItems: function() {
       var me = this,
           actions = [],
           originalActions;
        
       originalActions = this.callParent(arguments);
        
       actions.push({
           text: 'Remove',
           menuColumnHandler: function(item, eventData) {
               var record = eventData.record;
               me.removeDiscount(record);
           }
       });

       actions = Ext.Array.merge(actions, originalActions);

       return actions;
   }

   //,
   //getColumnConfig: function () {
   //    var me = this,
   //        columns = [
   //            {
   //                //xtype: 'gridcolumn',
   //                dataIndex: 'name',
   //                stateId: 'name',
   //                text: 'Name',
   //                hideable: false,
   //                flex: 1,
   //                minWidth: 150
   //                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
   //                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
   //                //}
   //            }
   //        ];

   //    return columns;
   //}

});